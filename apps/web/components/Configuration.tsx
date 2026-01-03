"use client";

import { useEstimator } from "@/lib/store";

const PROCESSES = [
  {
    id: "fdm",
    name: "FDM (Fused Deposition Modeling)",
    description: "Layer-by-layer extrusion, fast prototyping",
  },
  {
    id: "sla",
    name: "SLA (Stereolithography)",
    description: "High precision, excellent detail",
  },
  {
    id: "sls",
    name: "SLS (Selective Laser Sintering)",
    description: "Nylon prints, no supports needed",
  },
  {
    id: "mjf",
    name: "MJF (Multi Jet Fusion)",
    description: "Fast nylon production, fine features",
  },
];

const MATERIALS = [
  {
    id: "pla",
    processId: "fdm",
    name: "PLA",
    category: "Structural",
    description: "Standard, biodegradable",
  },
  {
    id: "abs",
    processId: "fdm",
    name: "ABS",
    category: "Structural",
    description: "Impact resistant, heat stable",
  },
  {
    id: "resin-clear",
    processId: "sla",
    name: "Clear Resin",
    category: "Visual",
    description: "Transparent, high detail",
  },
  {
    id: "nylon",
    processId: "sls",
    name: "Nylon",
    category: "Structural",
    description: "Strong, flexible, no supports",
  },
];

export function Configuration() {
  const {
    uploadedFile,
    selectedProcess,
    selectedMaterial,
    selectedTolerance,
    quantity,
    setProcess,
    setMaterial,
    setTolerance,
    setQuantity,
  } = useEstimator();

  if (!uploadedFile) return null;

  const availableMaterials = MATERIALS.filter(
    (m) => !selectedProcess || m.processId === selectedProcess
  );

  return (
    <div className="space-y-6">
      {/* Process Selection */}
      <div className="rounded-xl bg-white p-6 premium-shadow">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Manufacturing Process
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROCESSES.map((process) => (
            <button
              key={process.id}
              onClick={() => setProcess(process.id)}
              className={`
                rounded-lg border-2 px-4 py-3 text-left transition-all
                ${
                  selectedProcess === process.id
                    ? "border-accent-500 bg-accent-50"
                    : "border-slate-200 hover:border-slate-300"
                }
              `}
            >
              <p className="font-medium text-slate-900">{process.name}</p>
              <p className="text-xs text-slate-600">{process.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Material Selection */}
      {selectedProcess && (
        <div className="rounded-xl bg-white p-6 premium-shadow">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Material
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableMaterials.map((material) => (
              <button
                key={material.id}
                onClick={() => setMaterial(material.id)}
                className={`
                  rounded-lg border-2 px-4 py-3 text-left transition-all
                  ${
                    selectedMaterial === material.id
                      ? "border-accent-500 bg-accent-50"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                <p className="font-medium text-slate-900">{material.name}</p>
                <p className="text-xs text-slate-600">{material.category}</p>
                <p className="text-xs text-slate-500">{material.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tolerance & Quantity */}
      {selectedMaterial && (
        <div className="space-y-4 rounded-xl bg-white p-6 premium-shadow">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Tolerance Class
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {["STANDARD", "TIGHT", "CRITICAL"].map((tolerance) => (
                <button
                  key={tolerance}
                  onClick={() =>
                    setTolerance(tolerance as "STANDARD" | "TIGHT" | "CRITICAL")
                  }
                  className={`
                    rounded-lg border-2 px-3 py-2 text-center text-sm transition-all
                    ${
                      selectedTolerance === tolerance
                        ? "border-accent-500 bg-accent-50"
                        : "border-slate-200 hover:border-slate-300"
                    }
                  `}
                >
                  <p className="font-medium text-slate-900">{tolerance}</p>
                  <p className="text-xs text-slate-600">
                    {tolerance === "STANDARD"
                      ? "±0.3mm"
                      : tolerance === "TIGHT"
                        ? "±0.1mm"
                        : "±0.05mm"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900">
              Quantity: {quantity} unit{quantity !== 1 ? "s" : ""}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="mt-2 w-full accent-accent-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}
