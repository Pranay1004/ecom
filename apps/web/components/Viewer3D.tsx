"use client";

import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEstimator } from "@/lib/store";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

function Model({ url, ext }: { url: string; ext: string }) {
  const object = useMemo(() => url, [url]);

  // select loader based on extension
  if (ext === "stl") {
    const geom = useLoader(STLLoader, object);
    return (
      <mesh geometry={geom}>
        <meshStandardMaterial color="#8EA" metalness={0.1} roughness={0.6} />
      </mesh>
    );
  }

  if (ext === "obj") {
    const obj = useLoader(OBJLoader, object);
    return <primitive object={obj} />;
  }

  if (ext === "gltf" || ext === "glb") {
    const gltf = useLoader(GLTFLoader, object);
    return <primitive object={gltf.scene} />;
  }

  if (ext === "dae") {
    const collada = useLoader(ColladaLoader, object);
    return <primitive object={collada.scene} />;
  }

  if (ext === "3mf") {
    const threeMF = useLoader(ThreeMFLoader, object);
    return <primitive object={threeMF.scene || threeMF} />;
  }

  // fallback: try GLTF loader
  try {
    const gltf = useLoader(GLTFLoader, object);
    return <primitive object={gltf.scene} />;
  } catch (e) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={"#666"} />
      </mesh>
    );
  }
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
