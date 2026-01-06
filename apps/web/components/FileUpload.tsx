"use client";

import { useState, useRef } from "react";
import { useEstimator } from "@/lib/store";

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadedFile, setUploadedFile, setIsAnalyzing } = useEstimator();

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

    try {
      const engineUrl =
        (process.env.NEXT_PUBLIC_ENGINE_URL as string) || "http://localhost:8000";
      const form = new FormData();
      form.append("file", file, file.name);

      const resp = await fetch(`${engineUrl}/analyze`, {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Analysis failed: ${resp.status} ${text}`);
      }

      const json = await resp.json();

      // create local object URL for viewer
      if (uploadedFile?.fileUrl) {
        try {
          URL.revokeObjectURL(uploadedFile.fileUrl);
        } catch {
          // ignore
        }
      }
      const url = URL.createObjectURL(file);

      setUploadedFile({
        fileHash: Math.random().toString(36),
        fileName: file.name,
        boundingBox: json.boundingBox,
        volume: json.volume,
        surfaceArea: json.surfaceArea,
        estimatedMass: json.estimatedMass,
        complexityIndex: json.complexityIndex,
        warnings: json.warnings || [],
        fileUrl: url,
        fileObject: file,
        hasOverhangs: json.hasOverhangs,
        minWallThickness: json.minWallThickness,
        featureCount: json.featureCount,
      });
    } catch (err) {
      alert((err as Error).message || "Failed to analyze file");
    } finally {
      setIsAnalyzing(false);
    }
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
