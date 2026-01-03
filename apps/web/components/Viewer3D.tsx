"use client";

import { useEstimator } from "@/lib/store";

export function Viewer3D() {
  const { uploadedFile } = useEstimator();

  if (!uploadedFile) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl bg-slate-100">
        <p className="text-sm text-slate-600">Upload a file to see 3D preview</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <div className="h-96 rounded-lg bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-2">🎬</p>
          <p className="text-sm text-slate-400">
            Three.js viewer will render here
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Geometry: {uploadedFile.fileName}
          </p>
        </div>
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
