"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEstimator } from "@/lib/store";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import * as THREE from "three";

function ModelLoader({ url, ext }: { url: string; ext: string }) {
  const [object, setObject] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!url) return;
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();

        if (ext === "stl") {
          const loader = new STLLoader();
          const geom = loader.parse(buffer);
          const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: 0x8eaa8e }));
          if (!cancelled) setObject(mesh);
          return;
        }

        if (ext === "obj") {
          const loader = new OBJLoader();
          const text = new TextDecoder().decode(buffer);
          const obj = loader.parse(text);
          if (!cancelled) setObject(obj);
          return;
        }

        if (ext === "gltf" || ext === "glb") {
          const loader = new GLTFLoader();
          // GLTFLoader.parse expects ArrayBuffer and an optional path
          loader.parse(buffer, '', (gltf:any) => {
            if (!cancelled) setObject(gltf.scene);
          });
          return;
        }

        if (ext === "dae") {
          const loader = new ColladaLoader();
          const text = new TextDecoder().decode(buffer);
          const collada = loader.parse(text);
          if (!cancelled) setObject(collada.scene);
          return;
        }

        if (ext === "3mf") {
          const loader = new ThreeMFLoader();
          const result = loader.parse(buffer);
          const scene = result.scene || result;
          if (!cancelled) setObject(scene);
          return;
        }

        // fallback: try gltf parse
        try {
          const loader = new GLTFLoader();
          loader.parse(buffer, '', (gltf:any) => {
            if (!cancelled) setObject(gltf.scene);
          });
        } catch (e) {
          console.warn('Fallback parse failed', e);
        }
      } catch (e) {
        console.error('Model load error', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, ext]);

  if (!object) return null;
  return <primitive object={object} />;
}

export function Viewer3D() {
  const { uploadedFile } = useEstimator();

  if (!uploadedFile) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl bg-slate-100">
        <p className="text-sm text-slate-600">Upload a file to see 3D preview</p>
      </div>
    );
  }

  const ext = uploadedFile.fileName.split('.').pop()?.toLowerCase() || '';

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <div className="h-96 rounded-lg bg-slate-800">
        <Canvas camera={{ position: [0, 0, 200] }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 0, 1]} intensity={0.6} />
          <Suspense fallback={null}>
            <Model url={uploadedFile.fileUrl || ''} ext={ext} />
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} />
        </Canvas>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="rounded bg-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600">
          Rotate
        </button>
        <button className="rounded bg-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600">
          Show Warnings
        </button>
        <button className="rounded bg-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600">
          Orientation
        </button>
      </div>
    </div>
  );
}
