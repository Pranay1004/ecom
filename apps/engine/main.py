"""
Eshant 3D Manufacturing Engine

Geometry analysis, complexity calculation, feasibility checking.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import tempfile
import os
import trimesh
from math import acos
import zipfile
import xml.etree.ElementTree as ET

app = FastAPI(title="Eshant Engine", version="0.1.0")


class GeometryMetrics(BaseModel):
    boundingBox: dict  # {x, y, z}
    volume: float  # mm³
    surfaceArea: float  # mm²
    estimatedMass: float  # grams
    featureCount: int
    complexityIndex: float  # 0.0-1.5
    hasOverhangs: bool
    minWallThickness: float
    warnings: List[str]


class FeasibilityResult(BaseModel):
    feasible: bool
    blockers: List[str]
    warnings: List[str]
    recommendedOrientation: dict
    estimatedSupportVolume: float


@app.post("/analyze")
async def analyze_geometry(file: UploadFile = File(...)) -> GeometryMetrics:
    """
    Analyze uploaded 3D file and extract metrics.
    Supports STEP, STL, OBJ.
    """
    # Save uploaded file to a temporary path
    try:
        suffix = os.path.splitext(file.filename or "")[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Attempt to load mesh/scene with trimesh
        mesh_or_scene = None

        # Special-case 3MF: parse directly from ZIP/XML if trimesh doesn't support it
        _, ext = os.path.splitext(tmp_path)
        if ext.lower() == '.3mf':
            try:
                with zipfile.ZipFile(tmp_path, 'r') as zf:
                    # typical 3MF package stores model at 3D/3dmodel.model
                    name = None
                    for n in zf.namelist():
                        if n.lower().endswith('3d/3dmodel.model') or n.lower().endswith('3dmodel.model'):
                            name = n
                            break
                    if name is None:
                        raise Exception('No 3dmodel.model found inside 3mf')
                    xml_bytes = zf.read(name)
                    # parse XML
                    root = ET.fromstring(xml_bytes)
                    # default namespace handling
                    ns = {'ns': root.tag.split('}')[0].strip('{')}
                    meshes = []
                    for obj in root.findall('.//ns:object', ns):
                        mesh_node = obj.find('.//ns:mesh', ns)
                        if mesh_node is None:
                            continue
                        # vertices
                        verts = []
                        for v in mesh_node.findall('.//ns:vertices/ns:vertex', ns):
                            x = float(v.attrib.get('x', '0'))
                            y = float(v.attrib.get('y', '0'))
                            z = float(v.attrib.get('z', '0'))
                            verts.append([x, y, z])
                        # triangles
                        faces = []
                        for t in mesh_node.findall('.//ns:triangles/ns:triangle', ns):
                            v1 = int(t.attrib.get('v1', '0'))
                            v2 = int(t.attrib.get('v2', '0'))
                            v3 = int(t.attrib.get('v3', '0'))
                            faces.append([v1, v2, v3])
                        if len(verts) and len(faces):
                            m = trimesh.Trimesh(vertices=np.array(verts), faces=np.array(faces), process=True)
                            meshes.append(m)
                    if len(meshes) == 0:
                        raise Exception('No mesh parsed from 3mf')
                    mesh_or_scene = trimesh.util.concatenate(tuple(meshes))
            except Exception as e:
                mesh_or_scene = None

        if mesh_or_scene is None:
            try:
                mesh_or_scene = trimesh.load(tmp_path, force='mesh')
            except Exception:
                # fallback to generic load
                mesh_or_scene = trimesh.load(tmp_path)

        if mesh_or_scene is None:
            raise HTTPException(status_code=400, detail="Unable to parse geometry file")

        # Normalize loader output to a single Trimesh mesh
        mesh = None
        if isinstance(mesh_or_scene, trimesh.Scene):
            scene = mesh_or_scene
            if len(scene.geometry) == 0:
                raise HTTPException(status_code=400, detail="No geometry found in file")
            mesh = trimesh.util.concatenate(tuple(scene.geometry.values()))
        elif isinstance(mesh_or_scene, list) or isinstance(mesh_or_scene, tuple):
            if len(mesh_or_scene) == 0:
                raise HTTPException(status_code=400, detail="No geometry found in file")
            mesh = trimesh.util.concatenate(tuple(mesh_or_scene))
        elif isinstance(mesh_or_scene, dict):
            if len(mesh_or_scene) == 0:
                raise HTTPException(status_code=400, detail="No geometry found in file")
            mesh = trimesh.util.concatenate(tuple(mesh_or_scene.values()))
        else:
            mesh = mesh_or_scene

        # Heuristic: if model dimensions seem too small (<10), assume meters and scale to mm
        extents = mesh.bounding_box.extents
        max_dim = float(max(extents)) if len(extents) else 0.0
        if max_dim > 0 and max_dim < 10:
            mesh.apply_scale(1000.0)

        # Recompute bounding box and metrics
        bbox = mesh.bounding_box.extents.tolist()
        bounding = {"x": float(bbox[0]), "y": float(bbox[1]), "z": float(bbox[2])}

        # volumes/surface area in mm^3 and mm^2 respectively
        volume_mm3 = float(mesh.volume) if mesh.volume is not None else 0.0
        surface_mm2 = float(mesh.area) if mesh.area is not None else 0.0

        # convert to common reporting units: volume (cm^3), surface area (cm^2)
        volume_cm3 = volume_mm3 / 1000.0
        surface_cm2 = surface_mm2 / 100.0

        # estimate mass using default density (g/cm^3), assume PLA-like density
        density_g_cm3 = 1.24
        estimated_mass_g = volume_cm3 * density_g_cm3

        # feature count: number of connected components (computed without networkx)
        faces_arr = mesh.faces
        # union-find for faces via shared edges
        parent = list(range(len(faces_arr)))

        def find(a):
            while parent[a] != a:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a

        def union(a, b):
            ra = find(a); rb = find(b)
            if ra != rb:
                parent[rb] = ra

        edge_to_face = {}
        for fi, f in enumerate(faces_arr):
            edges = [(int(f[0]), int(f[1])), (int(f[1]), int(f[2])), (int(f[2]), int(f[0]))]
            for a, b in edges:
                if a > b:
                    a, b = b, a
                key = (a, b)
                if key in edge_to_face:
                    for other_fi in edge_to_face[key]:
                        union(fi, other_fi)
                    edge_to_face[key].append(fi)
                else:
                    edge_to_face[key] = [fi]

        roots = set(find(i) for i in range(len(parent)))
        feature_count = int(len(roots))

        # complexity index heuristic
        faces = mesh.faces.shape[0] if mesh.faces is not None else 0
        verts = mesh.vertices.shape[0] if mesh.vertices is not None else 0
        complexity_index = min(1.5, (faces / 20000.0) * 0.8 + (verts / 20000.0) * 0.2)

        # overhang detection: fraction of faces with normals pointing downward beyond threshold
        normals = mesh.face_normals
        # gravity vector (pointing down in Z)
        gravity = np.array([0.0, 0.0, -1.0])
        cos45 = np.cos(np.deg2rad(45.0))
        downward = np.dot(normals, gravity)
        # faces where the normal makes angle > 45deg with upward (i.e., dot < cos45)
        overhang_faces = np.sum(downward < cos45) if normals is not None else 0
        overhang_fraction = float(overhang_faces) / float(max(1, faces))
        has_overhangs = overhang_fraction > 0.02

        # approximate minimal wall thickness via edge length statistics
        edges = mesh.edges_unique_length if hasattr(mesh, 'edges_unique_length') else None
        if edges is None or len(edges) == 0:
            try:
                edges = mesh.edges_unique_length
            except Exception:
                edges = None

        min_wall_thickness = float(np.min(edges)) if edges is not None and len(edges) else 0.0

        warnings_list = []
        if min_wall_thickness and min_wall_thickness < 0.5:
            warnings_list.append("Thin walls detected")
        if has_overhangs:
            warnings_list.append(f"Overhangs present (~{int(overhang_fraction*100)}% faces)")

        # cleanup temp file
        try:
            os.remove(tmp_path)
        except Exception:
            pass

        return GeometryMetrics(
            boundingBox=bounding,
            volume=volume_cm3,
            surfaceArea=surface_cm2,
            estimatedMass=estimated_mass_g,
            featureCount=feature_count,
            complexityIndex=float(round(complexity_index, 3)),
            hasOverhangs=bool(has_overhangs),
            minWallThickness=float(round(min_wall_thickness, 3)),
            warnings=warnings_list,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/feasibility")
async def check_feasibility(
    fileHash: str,
    processId: str,
    materialId: str,
    toleranceClass: str,
) -> FeasibilityResult:
    """
    Check if configuration is feasible given geometry and constraints.
    """
    # Real: run against process capability matrix
    return FeasibilityResult(
        feasible=True,
        blockers=[],
        warnings=[],
        recommendedOrientation={"x": 0, "y": 0, "z": 1},
        estimatedSupportVolume=45000,
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
