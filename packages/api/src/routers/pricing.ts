import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const pricingRouter = router({
  // Get cost breakdown for a configuration
  estimateCost: publicProcedure
    .input(
      z.object({
        fileHash: z.string(),
        processId: z.string(),
        materialId: z.string(),
        quantity: z.number().min(1),
        toleranceClass: z.enum(["STANDARD", "TIGHT", "CRITICAL"]),
        finishLevel: z.enum([
          "AS_PRINTED",
          "CLEANED",
          "MACHINED",
          "POLISHED",
          "PAINTED",
        ]),
      })
    )
    .query(async ({ input }) => {
      // Real implementation calls pricing engine
      return {
        materialCost: 12.5,
        machineTimeCost: 45.0,
        setupCost: 10.0,
        postProcessingCost: 5.0,
        qaCost: 2.0,
        subtotal: 74.5,
        tax: 11.18,
        total: 85.68,
        costPerUnit: 85.68,
        breakdown: {
          material: "₹12.50 (15%)",
          machineTime: "₹45.00 (54%)",
          setup: "₹10.00 (12%)",
          postProcessing: "₹5.00 (6%)",
          qa: "₹2.00 (2%)",
        },
      };
    }),

  // Get lead time options
  getLeadTimes: publicProcedure
    .input(
      z.object({
        processId: z.string(),
        materialId: z.string(),
        estimatedPrintTime: z.number(),
      })
    )
    .query(async ({ input }) => {
      return {
        economy: {
          label: "Economy",
          estimatedDispatch: "2026-01-10",
          leadDays: 8,
          costMultiplier: 1.0,
          description: "Standard queue, best value",
        },
        standard: {
          label: "Standard",
          estimatedDispatch: "2026-01-07",
          leadDays: 5,
          costMultiplier: 1.15,
          description: "Priority queue, faster turnaround",
        },
        priority: {
          label: "Priority",
          estimatedDispatch: "2026-01-05",
          leadDays: 3,
          costMultiplier: 1.4,
          description: "Rush service, next available slot",
        },
      };
    }),
});
