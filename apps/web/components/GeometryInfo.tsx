"use client";

import { useEstimator } from "@/lib/store";

export function GeometryInfo() {
  const { uploadedFile } = useEstimator();

  if (!uploadedFile) return null;

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 premium-shadow">
      <h3 className="text-sm font-semibold text-slate-900">Geometry</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs text-slate-600">Bounding Box</p>
          <p className="text-sm font-mono font-semibold text-slate-900">
            {uploadedFile.boundingBox.x} × {uploadedFile.boundingBox.y} ×{" "}
            {uploadedFile.boundingBox.z} mm
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-600">Volume</p>
          <p className="text-sm font-mono font-semibold text-slate-900">
            {(uploadedFile.volume / 1000).toFixed(1)} cm³
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-600">Estimated Mass</p>
          <p className="text-sm font-mono font-semibold text-slate-900">
            {uploadedFile.estimatedMass.toFixed(2)}g
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-600">Surface Area</p>
          <p className="text-sm font-mono font-semibold text-slate-900">
            {(uploadedFile.surfaceArea / 100).toFixed(1)} cm²
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-600">Complexity</p>
          <p className="text-sm font-mono font-semibold text-slate-900">
            {uploadedFile.complexityIndex.toFixed(2)} / 1.5
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-600">Complexity Level</p>
          <p className="text-sm font-semibold text-slate-900">
            {uploadedFile.complexityIndex < 0.5
              ? "Low"
              : uploadedFile.complexityIndex < 1.0
                ? "Medium"
                : "High"}
          </p>
        </div>
      </div>

      {uploadedFile.warnings.length > 0 && (
        <div className="mt-4 space-y-2 rounded-lg bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">⚠️ Warnings</p>
          {uploadedFile.warnings.map((warning, idx) => (
            <p key={idx} className="text-xs text-amber-800">
              {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
