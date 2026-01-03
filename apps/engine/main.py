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
        try:
            mesh_or_scene = trimesh.load(tmp_path, force='mesh')
        except Exception:
            # fallback to generic load
            mesh_or_scene = trimesh.load(tmp_path)

        if mesh_or_scene is None:
            raise HTTPException(status_code=400, detail="Unable to parse geometry file")

        # If we got a Scene, combine into a single mesh
        if isinstance(mesh_or_scene, trimesh.Scene):
            scene = mesh_or_scene
            if len(scene.geometry) == 0:
                raise HTTPException(status_code=400, detail="No geometry found in file")
            mesh = trimesh.util.concatenate(tuple(scene.geometry.values()))
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

        # feature count: number of connected components or face groups
        feature_count = int(len(mesh.split()))

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
