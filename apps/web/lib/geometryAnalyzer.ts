/**
 * Client-side geometry analysis using Three.js
 * Eliminates dependency on external engine for volume, surface area, bounding box calculations
 */
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export interface GeometryAnalysis {
  boundingBox: { x: number; y: number; z: number };
  volume: number; // in mm³
  surfaceArea: number; // in mm²
  estimatedMass: number; // in grams (using default PLA density)
  complexityIndex: number;
  warnings: string[];
  hasOverhangs: boolean;
  minWallThickness: number;
  featureCount: number;
}

// Default density for PLA in g/mm³
const DEFAULT_DENSITY = 0.00124; // ~1.24 g/cm³ = 0.00124 g/mm³

/**
 * Compute signed volume of a triangle (used for mesh volume calculation)
 * Using the signed volume method: V = (1/6) * |a · (b × c)|
 */
function signedVolumeOfTriangle(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3
): number {
  return p1.dot(p2.clone().cross(p3)) / 6.0;
}

/**
 * Calculate area of a triangle given three vertices
 */
function triangleArea(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3
): number {
  const ab = p2.clone().sub(p1);
  const ac = p3.clone().sub(p1);
  return ab.cross(ac).length() / 2.0;
}

/**
 * Analyze a BufferGeometry to compute volume and surface area
 */
function analyzeBufferGeometry(geometry: THREE.BufferGeometry): {
  volume: number;
  surfaceArea: number;
  triangleCount: number;
} {
  // Ensure geometry has position attribute
  const position = geometry.getAttribute("position");
  if (!position) {
    return { volume: 0, surfaceArea: 0, triangleCount: 0 };
  }

  // If indexed, de-index for easier processing
  let positions: Float32Array;
  if (geometry.index) {
    const nonIndexed = geometry.toNonIndexed();
    const pos = nonIndexed.getAttribute("position");
    positions = new Float32Array(pos.array);
  } else {
    positions = new Float32Array(position.array);
  }

  let volume = 0;
  let surfaceArea = 0;
  const triangleCount = positions.length / 9;

  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const p3 = new THREE.Vector3();

  for (let i = 0; i < positions.length; i += 9) {
    p1.set(positions[i], positions[i + 1], positions[i + 2]);
    p2.set(positions[i + 3], positions[i + 4], positions[i + 5]);
    p3.set(positions[i + 6], positions[i + 7], positions[i + 8]);

    // Accumulate signed volume
    volume += signedVolumeOfTriangle(p1, p2, p3);

    // Accumulate surface area
    surfaceArea += triangleArea(p1, p2, p3);
  }

  // Take absolute value of volume (handles winding order issues)
  return {
    volume: Math.abs(volume),
    surfaceArea,
    triangleCount,
  };
}

/**
 * Recursively collect all geometries from an Object3D
 */
function collectGeometries(
  object: THREE.Object3D,
  geometries: THREE.BufferGeometry[]
): void {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        // Clone and apply world transform so measurements are in world space
        const geo = mesh.geometry.clone();
        geo.applyMatrix4(mesh.matrixWorld);
        geometries.push(geo);
      }
    }
  });
}

/**
 * Analyze a Three.js Object3D (mesh, group, scene)
 */
export function analyzeObject3D(object: THREE.Object3D): GeometryAnalysis {
  // Update world matrices
  object.updateMatrixWorld(true);

  // Compute bounding box
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  const boundingBox = {
    x: Math.round(size.x * 100) / 100,
    y: Math.round(size.y * 100) / 100,
    z: Math.round(size.z * 100) / 100,
  };

  // Collect all geometries
  const geometries: THREE.BufferGeometry[] = [];
  collectGeometries(object, geometries);

  // Sum up volume and surface area from all geometries
  let totalVolume = 0;
  let totalSurfaceArea = 0;
  let totalTriangles = 0;

  for (const geo of geometries) {
    const result = analyzeBufferGeometry(geo);
    totalVolume += result.volume;
    totalSurfaceArea += result.surfaceArea;
    totalTriangles += result.triangleCount;
    geo.dispose(); // Clean up cloned geometry
  }

  // Estimate mass using default PLA density
  const estimatedMass = Math.round(totalVolume * DEFAULT_DENSITY * 100) / 100;

  // Complexity index based on triangle count and surface-to-volume ratio
  const surfaceToVolume = totalVolume > 0 ? totalSurfaceArea / totalVolume : 0;
  const complexityIndex = Math.min(
    10,
    Math.round((totalTriangles / 10000 + surfaceToVolume * 10) * 10) / 10
  );

  // Simple heuristics for warnings and features
  const warnings: string[] = [];
  const maxDim = Math.max(boundingBox.x, boundingBox.y, boundingBox.z);
  const minDim = Math.min(boundingBox.x, boundingBox.y, boundingBox.z);

  if (maxDim > 300) {
    warnings.push("Part exceeds typical build volume (300mm max dimension)");
  }
  if (minDim < 1) {
    warnings.push("Very thin dimension detected, may be difficult to print");
  }
  if (totalVolume < 10) {
    warnings.push("Very small volume, consider scaling up");
  }

  // Estimate overhang likelihood (rough heuristic)
  // A high surface-to-volume ratio often indicates complex geometry with overhangs
  const hasOverhangs = surfaceToVolume > 0.5;

  // Rough wall thickness estimate based on bounding box
  const minWallThickness = Math.min(
    boundingBox.x / 10,
    boundingBox.y / 10,
    boundingBox.z / 10,
    2.0 // Cap at 2mm
  );

  return {
    boundingBox,
    volume: Math.round(totalVolume * 100) / 100,
    surfaceArea: Math.round(totalSurfaceArea * 100) / 100,
    estimatedMass,
    complexityIndex,
    warnings,
    hasOverhangs,
    minWallThickness: Math.round(minWallThickness * 100) / 100,
    featureCount: totalTriangles,
  };
}

/**
 * Load and analyze a file directly from File object
 */
export async function analyzeFile(file: File): Promise<GeometryAnalysis> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const arrayBuffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    try {
      let object: THREE.Object3D | null = null;

      if (ext === "stl") {
        const loader = new STLLoader();
        const geometry = loader.parse(arrayBuffer);
        object = new THREE.Mesh(geometry);
        resolve(analyzeObject3D(object));
        geometry.dispose();
      } else if (ext === "obj") {
        const loader = new OBJLoader();
        const text = new TextDecoder().decode(arrayBuffer);
        object = loader.parse(text);
        resolve(analyzeObject3D(object));
      } else if (ext === "glb" || ext === "gltf") {
        const loader = new GLTFLoader();
        loader.parse(
          arrayBuffer,
          "",
          (gltf) => {
            resolve(analyzeObject3D(gltf.scene));
          },
          (error) => {
            reject(new Error(`Failed to parse GLTF: ${error.message}`));
          }
        );
      } else if (ext === "3mf") {
        // 3MF requires ThreeMFLoader - provide fallback analysis
        resolve(createFallbackAnalysis(file.name, arrayBuffer.byteLength));
      } else if (ext === "dae") {
        // COLLADA requires ColladaLoader - provide fallback
        resolve(createFallbackAnalysis(file.name, arrayBuffer.byteLength));
      } else if (["step", "stp", "iges", "igs", "sla"].includes(ext)) {
        // CAD formats need server-side processing - provide fallback
        resolve(createFallbackAnalysis(file.name, arrayBuffer.byteLength));
      } else {
        reject(new Error(`Unsupported file format: ${ext}`));
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create fallback analysis for unsupported formats
 * Estimates based on file size (rough heuristic)
 */
function createFallbackAnalysis(
  fileName: string,
  fileSize: number
): GeometryAnalysis {
  // Very rough estimation based on file size
  // Average STL has ~50 bytes per triangle, each triangle ~0.5mm² surface
  const estimatedTriangles = Math.max(100, fileSize / 50);
  const estimatedSurfaceArea = estimatedTriangles * 0.5;
  const estimatedVolume = Math.pow(estimatedSurfaceArea / 6, 1.5); // Rough sphere-like estimate

  return {
    boundingBox: { x: 50, y: 50, z: 50 }, // Default 50mm cube
    volume: Math.round(estimatedVolume),
    surfaceArea: Math.round(estimatedSurfaceArea),
    estimatedMass: Math.round(estimatedVolume * DEFAULT_DENSITY * 100) / 100,
    complexityIndex: 5, // Medium complexity
    warnings: [
      `${fileName.split(".").pop()?.toUpperCase()} format: geometry estimated from file size`,
    ],
    hasOverhangs: true, // Assume yes for safety
    minWallThickness: 1.0,
    featureCount: Math.round(estimatedTriangles),
  };
}
