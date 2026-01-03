"use client";

import { useState, useRef } from "react";
import { useEstimator } from "@/lib/store";

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { setUploadedFile, setIsAnalyzing } = useEstimator();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Check file extension (more reliable than MIME type for CAD files)
    const extension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = [
      "step", "stp",  // STEP
      "stl",          // STL
      "obj",          // OBJ
      "sla",          // SLA/Stereolithography
      "3mf",          // 3D Manufacturing Format
      "iges", "igs",  // IGES
      "gltf", "glb",  // glTF
      "dae",          // COLLADA
    ];
    
    if (!extension || !validExtensions.includes(extension)) {
      alert("Unsupported format. Please upload STEP, STL, OBJ, 3MF, SLA, IGES, glTF, or COLLADA files.");
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis (real: send to backend)
    setTimeout(() => {
      setUploadedFile({
        fileHash: Math.random().toString(36),
        fileName: file.name,
        boundingBox: { x: 100, y: 80, z: 60 },
        volume: 480000,
        surfaceArea: 47200,
        estimatedMass: 0.576,
        complexityIndex: 0.65,
        warnings: ["Thin walls detected", "Overhangs present"],
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative w-full rounded-xl border-2 border-dashed p-8 text-center
        transition-all duration-200
        ${
          dragActive
            ? "border-accent-500 bg-accent-50"
            : "border-slate-300 hover:border-slate-400"
        }
      `}
    >
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".step,.stp,.stl,.obj,.sla,.3mf,.iges,.igs,.gltf,.glb,.dae"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />

      <div className="space-y-2">
        <div className="text-4xl">📦</div>
        <p className="text-lg font-medium text-slate-900">Upload your part</p>
        <p className="text-sm text-slate-600">
          STEP, STL, 3MF, OBJ, IGES, glTF, or COLLADA. Up to 100 MB.
        </p>
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        className="
          mt-4 inline-block rounded-lg bg-accent-600 px-4 py-2
          text-sm font-medium text-white
          hover:bg-accent-700 transition-colors
        "
      >
        Select file
      </button>
    </div>
  );
}
