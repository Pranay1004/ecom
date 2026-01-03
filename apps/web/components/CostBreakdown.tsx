"use client";

import { useEstimator } from "@/lib/store";

export function CostBreakdown() {
  const { estimatedCost, costBreakdown, quantity, selectedMaterial } =
    useEstimator();

  if (!estimatedCost || !costBreakdown) return null;

  return (
    <div className="rounded-xl bg-white p-6 premium-shadow">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Cost Estimate
      </h3>

      <div className="space-y-3">
        {Object.entries(costBreakdown).map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-slate-100 pb-2"
          >
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-sm font-mono font-semibold text-slate-900">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-100 p-3">
        <p className="font-semibold text-slate-900">Total ({quantity}×)</p>
        <p className="text-xl font-mono font-bold text-accent-600">
          ₹{(estimatedCost * quantity).toFixed(2)}
        </p>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Per unit: ₹{estimatedCost.toFixed(2)}
      </p>
    </div>
  );
}
