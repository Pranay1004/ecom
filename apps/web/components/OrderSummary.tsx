"use client";

import { useEstimator } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { perGramBaseRates, perMaterialModifiers } from "@/lib/rates";

export function OrderSummary() {
  const {
    uploadedFile,
    selectedProcess,
    selectedMaterial,
    selectedTolerance,
    quantity,
  } = useEstimator();
  const router = useRouter();

  if (!uploadedFile) {
    return (
      <div className="rounded-xl bg-slate-100 p-6">
        <p className="text-sm text-slate-600">Upload a file to see order summary</p>
      </div>
    );
  }

  // Calculate pricing based on configuration
  const basePrice = (uploadedFile.volume || 1) * 2.5; // ₹2.5 per cm³
  const processMultiplier =
    selectedProcess === "fdm" ? 1 :
    selectedProcess === "sla" ? 2.5 :
    selectedProcess === "sls" ? 3 :
    selectedProcess === "mjf" ? 2.8 : 1;
  const materialMultiplier =
    selectedMaterial === "pla" ? 1 :
    selectedMaterial === "abs" ? 1.2 :
    selectedMaterial === "nylon" ? 2 :
    selectedMaterial === "resin" ? 1.8 : 1;
  const toleranceMultiplier =
    selectedTolerance === "STANDARD" ? 1 :
    selectedTolerance === "TIGHT" ? 1.3 :
    selectedTolerance === "CRITICAL" ? 1.8 : 1;

  // Weight input (grams) - user can override; default to uploadedFile.weight if present
  const [weightGrams, setWeightGrams] = useState<number>((uploadedFile as any).weight || 50);

  const unitPrice = basePrice * processMultiplier * materialMultiplier * toleranceMultiplier;
  const volumeSubtotal = unitPrice * quantity;

  // Weight-based material cost using per-gram rates for the selected process
  const baseRate = perGramBaseRates[selectedProcess || "fdm"] || perGramBaseRates.fdm;
  const materialMod = perMaterialModifiers[selectedMaterial || "pla"] || perMaterialModifiers.pla;
  const ratePerGram = baseRate * materialMod;
  const weightCost = ratePerGram * weightGrams * quantity;

  const subtotal = volumeSubtotal + weightCost;
  const shipping = subtotal > 5000 ? 0 : 150;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const canProceed = selectedProcess && selectedMaterial && quantity > 0;

  const handleProceedToCheckout = () => {
    // Save pricing to session storage for checkout page
    sessionStorage.setItem("orderPreview", JSON.stringify({
      fileName: uploadedFile.fileName,
      process: selectedProcess,
      material: selectedMaterial,
      tolerance: selectedTolerance,
      quantity,
      unitPrice,
      subtotal,
      shipping,
      tax,
      total,
      weightGrams,
      ratePerGram,
      weightCost,
      fileHash: uploadedFile.fileHash,
      volume: uploadedFile.volume,
      boundingBox: uploadedFile.boundingBox,
    }));
    router.push("/checkout");
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">File</span>
          <span className="font-medium text-slate-900 truncate max-w-[180px]">
            {uploadedFile.fileName}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Process</span>
          <span className="font-medium text-slate-900">
            {selectedProcess?.toUpperCase() || "Not selected"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Material</span>
          <span className="font-medium text-slate-900">
            {selectedMaterial?.toUpperCase() || "Not selected"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Tolerance</span>
          <span className="font-medium text-slate-900">{selectedTolerance}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Quantity</span>
          <span className="font-medium text-slate-900">{quantity}</span>
        </div>
        {/* Weight input for per-gram pricing */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-slate-600 block">Weight (grams)</span>
            <input
              type="number"
              min={0}
              value={weightGrams}
              onChange={(e) => setWeightGrams(Number(e.target.value) || 0)}
              className="mt-1 w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm"
            />
            <div className="text-xs text-slate-400">per part</div>
          </div>
          <div className="text-right">
            <div className="text-slate-600">Rate</div>
            <div className="font-medium text-slate-900">₹{ratePerGram.toFixed(2)}/g</div>
          </div>
        </div>
        <hr className="my-3" />

        <div className="flex justify-between">
          <span className="text-slate-600">Unit Price (volume-based)</span>
          <span className="font-medium text-slate-900">₹{unitPrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Material Cost (weight-based)</span>
          <span className="font-medium text-slate-900">₹{weightCost.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Shipping</span>
          <span className="font-medium text-slate-900">
            {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">GST (18%)</span>
          <span className="font-medium text-slate-900">₹{tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Total weight</span>
          <span className="font-medium text-slate-900">{(weightGrams * quantity).toFixed(0)} g</span>
        </div>

        <hr className="my-3" />

        <div className="flex justify-between text-lg">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="font-bold text-accent-600">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleProceedToCheckout}
        disabled={!canProceed}
        className={`mt-6 w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
          canProceed
            ? "bg-accent-600 text-white hover:bg-accent-700"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {canProceed ? "Proceed to Checkout" : "Complete configuration to continue"}
      </button>

      {!canProceed && (
        <p className="mt-2 text-xs text-slate-500 text-center">
          Select a process and material to continue
        </p>
      )}
    </div>
  );
}
