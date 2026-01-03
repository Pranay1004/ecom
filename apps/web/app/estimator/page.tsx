"use client";

import { FileUpload } from "@/components/FileUpload";
import { Viewer3D } from "@/components/Viewer3D";
import { GeometryInfo } from "@/components/GeometryInfo";
import { Configuration } from "@/components/Configuration";
import { CostBreakdown } from "@/components/CostBreakdown";
import { useEstimator } from "@/lib/store";

export default function EstimatorPage() {
  const { uploadedFile, isAnalyzing } = useEstimator();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">
            3D Print Estimator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload your geometry, configure manufacturing process, get instant
            pricing
          </p>
        </div>
      </div>

      {/* Main estimator */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl bg-white p-6 premium-shadow">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">
                Configuration
              </h2>
              {!uploadedFile ? (
                <>
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="inline-block animate-spin">
                          <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-accent-600" />
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Analyzing geometry...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <FileUpload />
                  )}
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm font-medium text-slate-900">
                    ✓ {uploadedFile.fileName}
                  </p>
                  <Configuration />
                </>
              )}
            </div>

            {uploadedFile && <CostBreakdown />}
          </div>

          {/* Center & Right: 3D + Info */}
          <div className="lg:col-span-2 space-y-6">
            <Viewer3D />
            {uploadedFile && <GeometryInfo />}
          </div>
        </div>
      </div>
    </main>
  );
}
