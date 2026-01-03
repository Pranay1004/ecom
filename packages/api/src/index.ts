import { router, publicProcedure } from "./trpc";
import { geometryRouter } from "./routers/geometry";
import { pricingRouter } from "./routers/pricing";

export const appRouter = router({
  geometry: geometryRouter,
  pricing: pricingRouter,
  health: publicProcedure.query(() => ({ status: "ok" })),
});

export type AppRouter = typeof appRouter;
