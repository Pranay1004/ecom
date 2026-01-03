import { create } from "zustand";

interface UploadedFile {
  fileHash: string;
  fileName: string;
  boundingBox: { x: number; y: number; z: number };
  volume: number;
  surfaceArea: number;
  estimatedMass: number;
  complexityIndex: number;
  warnings: string[];
  fileUrl?: string | null;
  hasOverhangs?: boolean;
  minWallThickness?: number;
  featureCount?: number;
}

interface EstimatorState {
  // Upload state
  uploadedFile: UploadedFile | null;
  isAnalyzing: boolean;

  // Configuration state
  selectedProcess: string | null;
  selectedMaterial: string | null;
  selectedTolerance: "STANDARD" | "TIGHT" | "CRITICAL";
  quantity: number;
  finishLevel: string;

  // Feasibility state
  isFeasible: boolean;
  feasibilityErrors: string[];

  // Pricing state
  estimatedCost: number | null;
  costBreakdown: Record<string, any> | null;

  // Actions
  setUploadedFile: (file: UploadedFile) => void;
  setIsAnalyzing: (state: boolean) => void;
  setProcess: (id: string) => void;
  setMaterial: (id: string) => void;
  setTolerance: (tolerance: "STANDARD" | "TIGHT" | "CRITICAL") => void;
  setQuantity: (qty: number) => void;
  setFinishLevel: (level: string) => void;
  setFeasibility: (feasible: boolean, errors: string[]) => void;
  setCostEstimate: (cost: number, breakdown: Record<string, any>) => void;
  reset: () => void;
}

export const useEstimator = create<EstimatorState>((set) => ({
  uploadedFile: null,
  isAnalyzing: false,
  selectedProcess: null,
  selectedMaterial: null,
  selectedTolerance: "STANDARD",
  quantity: 1,
  finishLevel: "AS_PRINTED",
  isFeasible: false,
  feasibilityErrors: [],
  estimatedCost: null,
  costBreakdown: null,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setIsAnalyzing: (state) => set({ isAnalyzing: state }),
  setProcess: (id) => set({ selectedProcess: id }),
  setMaterial: (id) => set({ selectedMaterial: id }),
  setTolerance: (tolerance) => set({ selectedTolerance: tolerance }),
  setQuantity: (qty) => set({ quantity: Math.max(1, qty) }),
  setFinishLevel: (level) => set({ finishLevel: level }),
  setFeasibility: (feasible, errors) =>
    set({ isFeasible: feasible, feasibilityErrors: errors }),
  setCostEstimate: (cost, breakdown) =>
    set({ estimatedCost: cost, costBreakdown: breakdown }),
  reset: () =>
    set({
      uploadedFile: null,
      isAnalyzing: false,
      selectedProcess: null,
      selectedMaterial: null,
      selectedTolerance: "STANDARD",
      quantity: 1,
      finishLevel: "AS_PRINTED",
      isFeasible: false,
      feasibilityErrors: [],
      estimatedCost: null,
      costBreakdown: null,
    }),
}));
