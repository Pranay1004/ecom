// Per-gram base rates and per-material modifiers for costing
export const perGramBaseRates: Record<string, number> = {
  fdm: 0.8,
  sla: 4.0,
  sls: 6.5,
  mjf: 5.5,
};

// Material modifiers applied to the per-gram base rate
export const perMaterialModifiers: Record<string, number> = {
  pla: 1.0,
  abs: 1.15,
  nylon: 1.35,
  resin: 1.25,
};

export default { perGramBaseRates, perMaterialModifiers };
