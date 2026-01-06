"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEstimator } from "@/lib/store";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import * as THREE from "three";

function normalizeMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if ((mesh as any).isMesh) {
      if (!mesh.material) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0x8ea0b8,
          metalness: 0.05,
          roughness: 0.65,
        });
      }
    }
  });
}

function FitCamera({ object }: { object: THREE.Object3D | null }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!object) return;
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim > 0 ? maxDim * 1.8 : 200;

    camera.near = Math.max(0.1, dist / 1000);
    camera.far = Math.max(1000, dist * 10);
    // Model is centered at origin; keep controls stable by looking at (0,0,0)
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [object, camera]);

  return null;
}

function ModelLoader({
  file,
  url,
  ext,
  onLoaded,
  onError,
}: {
  file?: File | null;
  url?: string | null;
  ext: string;
  onLoaded: (obj: THREE.Object3D) => void;
  onError: (err: unknown) => void;
}) {
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Safari sometimes throws `TypeError: Load failed` on fetch(blob:...)
        const buffer = file
          ? await file.arrayBuffer()
          : url
            ? await (await fetch(url)).arrayBuffer()
            : null;

        if (!buffer) return;

        if (ext === "stl") {
          const loader = new STLLoader();
          const geom = loader.parse(buffer);
          const mesh = new THREE.Mesh(
            geom,
            new THREE.MeshStandardMaterial({
              color: 0x8ea0b8,
              metalness: 0.05,
              roughness: 0.65,
            })
          );
          if (!cancelled) onLoaded(mesh);
          return;
        }

        if (ext === "obj") {
          const loader = new OBJLoader();
          const text = new TextDecoder().decode(buffer);
          const obj = loader.parse(text);
          normalizeMaterials(obj);
          if (!cancelled) onLoaded(obj);
          return;
        }

        if (ext === "dae") {
          const loader = new ColladaLoader();
          const text = new TextDecoder().decode(buffer);
          const collada = loader.parse(text, "");
          normalizeMaterials(collada.scene);
          if (!cancelled) onLoaded(collada.scene);
          return;
        }

        if (ext === "3mf") {
          const loader = new ThreeMFLoader();
          const result = loader.parse(buffer);
          const scene = (result as any).scene || (result as any);
          normalizeMaterials(scene);
          if (!cancelled) onLoaded(scene);
          return;
        }

        if (ext === "gltf" || ext === "glb") {
          const loader = new GLTFLoader();
          loader.parse(
            buffer,
            "",
            (gltf: any) => {
              if (cancelled) return;
              normalizeMaterials(gltf.scene);
              onLoaded(gltf.scene);
            },
            (e) => {
              if (cancelled) return;
              onError(e);
            }
          );
          return;
        }

        // fallback: try GLTF
        const loader = new GLTFLoader();
        loader.parse(
          buffer,
          "",
          (gltf: any) => {
            if (cancelled) return;
            normalizeMaterials(gltf.scene);
            onLoaded(gltf.scene);
          },
          (e) => {
            if (cancelled) return;
            onError(e);
          }
        );
      } catch (e) {
        if (!cancelled) onError(e);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [file, url, ext, onLoaded, onError]);

  return null;
}

export function Viewer3D() {
  const { uploadedFile } = useEstimator();

  const [object, setObject] = useState<THREE.Object3D | null>(null);
  const [fallbackTried, setFallbackTried] = useState(false);
  const [rotationAxis, setRotationAxis] = useState<"x" | "y" | "z">("y");
  const [showWarnings, setShowWarnings] = useState(false);

  useEffect(() => {
    setObject(null);
    setFallbackTried(false);
    setShowWarnings(false);
  }, [uploadedFile?.fileUrl, uploadedFile?.fileName]);

  // Auto-rotate effect
  useEffect(() => {
    if (!object) return;
    let animId: number;
    let rotating = false;
    const rotate = () => {
      if (rotating && object) {
        object.rotation[rotationAxis] += 0.02;
        animId = requestAnimationFrame(rotate);
      }
    };
    // Expose toggle on window for button
    (window as any).__viewer_toggleRotate = () => {
      rotating = !rotating;
      if (rotating) rotate();
      else cancelAnimationFrame(animId);
    };
    return () => {
      cancelAnimationFrame(animId);
      delete (window as any).__viewer_toggleRotate;
    };
  }, [object, rotationAxis]);

  const handleRotate = () => {
    (window as any).__viewer_toggleRotate?.();
  };

  const handleOrientation = () => {
    if (!object) return;
    // Cycle through orientations: reset → rotate X 90 → rotate Z 90
    object.rotation.set(0, 0, 0);
    const next = rotationAxis === "y" ? "x" : rotationAxis === "x" ? "z" : "y";
    setRotationAxis(next);
    object.rotation[next] = Math.PI / 2;
  };

  if (!uploadedFile) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl bg-slate-100">
        <p className="text-sm text-slate-600">Upload a file to see 3D preview</p>
      </div>
    );
  }

  const ext = uploadedFile.fileName.split(".").pop()?.toLowerCase() || "";

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <div className="h-96 rounded-lg bg-slate-800">
        <Canvas camera={{ position: [0, 0, 200] }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 0, 1]} intensity={0.6} />
          <Suspense fallback={null}>
            <ModelLoader
              file={uploadedFile.fileObject || null}
              url={uploadedFile.fileUrl || null}
              ext={ext}
              onLoaded={(obj) => {
                // center model at origin for stable orbit controls
                const box = new THREE.Box3().setFromObject(obj);
                const center = new THREE.Vector3();
                box.getCenter(center);
                obj.position.sub(center);
                setObject(obj);
              }}
              onError={async (e) => {
                if (!fallbackTried && uploadedFile.fileObject) {
                  setFallbackTried(true);
                  const engineUrl =
                    (process.env.NEXT_PUBLIC_ENGINE_URL as string) || "http://localhost:8000";
                  // try GLB first
                  try {
                    const form = new FormData();
                    form.append("file", uploadedFile.fileObject, uploadedFile.fileName);
                    const resp = await fetch(`${engineUrl}/preview-glb`, {
                      method: "POST",
                      body: form,
                    });
                    if (resp.ok) {
                      const buffer = await resp.arrayBuffer();
                      const loader = new GLTFLoader();
                      loader.parse(
                        buffer,
                        "",
                        (gltf: any) => {
                          normalizeMaterials(gltf.scene);
                          setObject(gltf.scene);
                        },
                        (err) => {
                          throw err;
                        }
                      );
                      return;
                    }
                  } catch (glbErr) {
                    console.warn("GLB fallback failed, trying STL", glbErr);
                  }

                  // try STL fallback
                  try {
                    const form2 = new FormData();
                    form2.append("file", uploadedFile.fileObject, uploadedFile.fileName);
                    const resp2 = await fetch(`${engineUrl}/preview-stl`, {
                      method: "POST",
                      body: form2,
                    });
                    if (resp2.ok) {
                      const buffer2 = await resp2.arrayBuffer();
                      const loader2 = new STLLoader();
                      const geom = loader2.parse(buffer2);
                      const mesh = new THREE.Mesh(
                        geom,
                        new THREE.MeshStandardMaterial({
                          color: 0x8ea0b8,
                          metalness: 0.05,
                          roughness: 0.65,
                        })
                      );
                      setObject(mesh);
                      return;
                    }
                  } catch (stlErr) {
                    console.error("STL fallback failed:", stlErr);
                  }
                }

                const msg =
                  (e as any)?.message ||
                  (e as any)?.toString?.() ||
                  "Load failed";
                alert(msg);
                console.error("Viewer load error:", e);
              }}
            />
          </Suspense>
          {object ? <primitive object={object} /> : null}
          <FitCamera object={object} />
          <OrbitControls enablePan={true} enableZoom={true} enableDamping={true} dampingFactor={0.08} />
        </Canvas>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={handleRotate}
          className="rounded bg-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600"
        >
          Rotate
        </button>
        <button
          onClick={() => setShowWarnings((v) => !v)}
          className="rounded bg-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600"
        >
          {showWarnings ? "Hide Warnings" : "Show Warnings"}
        </button>
        <button
          onClick={handleOrientation}
          className="rounded bg-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600"
        >
          Orientation ({rotationAxis.toUpperCase()})
        </button>
      </div>

      {showWarnings && uploadedFile.warnings && uploadedFile.warnings.length > 0 && (
        <div className="mt-2 rounded bg-yellow-100 p-2 text-xs text-yellow-800">
          <strong>Warnings:</strong>
          <ul className="ml-4 list-disc">
            {uploadedFile.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
