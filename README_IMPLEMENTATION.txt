================================================================================
ESHANT 3D ECOMMERCE - IMPLEMENTATION HISTORY & ARCHITECTURE
================================================================================
Last Updated: January 9, 2026

================================================================================
1. PROJECT OVERVIEW
================================================================================

Engineering-first 3D printing ecommerce platform with:
- Geometry-based feasibility checking
- Transparent cost breakdown (material, weight, process)
- Real-time 3D model preview and analysis
- Order management flow (preview → checkout → payment → confirmation)

Target: Hobby/demo project with potential for production scale

================================================================================
2. ARCHITECTURE & TECHNOLOGY STACK
================================================================================

2.1 MONOREPO STRUCTURE (Turborepo + pnpm workspaces)
------------------------------------------------------------
Root/
├── apps/
│   ├── web/          # Next.js 14 frontend (TypeScript, Tailwind, Three.js)
│   └── engine/       # FastAPI Python backend (trimesh, geometry analysis)
├── packages/
│   ├── api/          # tRPC API definitions (planned, minimal usage)
│   └── db/           # Prisma schemas (planned, not yet integrated)
└── turbo.json        # Turborepo build orchestration

2.2 FRONTEND (apps/web)
------------------------------------------------------------
- Framework: Next.js 14.2.35 (App Router)
- UI: React 18 + TailwindCSS
- 3D Rendering: Three.js + @react-three/fiber + @react-three/drei
- State: Zustand (order store)
- Styling: Tailwind + class-variance-authority

Key Pages:
  - / (landing page)
  - /estimator (main app: file upload + 3D viewer + pricing)
  - /checkout (order summary)
  - /payment (mock payment flow: card/UPI/net banking)
  - /order-success (confirmation + email trigger)

Key Components:
  - FileUpload.tsx: STL/GLB upload → sends to engine
  - Viewer3D.tsx: Three.js canvas, rotate/orientation/warnings controls
  - OrderSummary.tsx: pricing breakdown (material, weight, process costs)

2.3 BACKEND ENGINE (apps/engine)
------------------------------------------------------------
- Framework: FastAPI + Uvicorn
- Geometry: trimesh library (Python)
- Purpose: Parse STL/GLB, compute volume/bbox/area, generate preview meshes

Endpoints:
  - GET /health → {status: "healthy"}
  - POST /preview-stl → returns blob for viewer
  - POST /preview-glb → returns blob for viewer
  - POST /analyze (planned) → geometry metrics

Deployment: Render free tier (https://ecom-idmq.onrender.com)

2.4 PRICING LOGIC
------------------------------------------------------------
File: apps/web/lib/rates.ts

Base rates (per gram):
  - FDM: ₹2.5/g
  - SLA: ₹8/g
  - SLS: ₹12/g
  - MJF: ₹10/g

Material modifiers (multiplier):
  - PLA: 1.0x
  - ABS: 1.2x
  - PETG: 1.15x
  - Nylon: 1.4x
  - TPU: 1.8x
  - Resin (Standard): 1.0x
  - PA12: 1.3x

Material densities (g/cm³):
  - PLA: 1.24, ABS: 1.05, PETG: 1.27, Nylon: 1.14, TPU: 1.2
  - Resin: 1.2, PA12: 1.01, PA11: 1.03

Auto-weight estimation:
  volume (mm³) → cm³ → × density → grams → × rate → cost

================================================================================
3. IMPLEMENTED FEATURES
================================================================================

3.1 FILE UPLOAD & 3D PREVIEW
------------------------------------------------------------
✅ Drag-and-drop STL/GLB upload
✅ Three.js viewer with orbit controls
✅ Rotate model buttons (X/Y/Z axis, 90°)
✅ Orientation preset buttons (Front/Top/Right)
✅ Show/hide geometry warnings toggle
✅ Wireframe + bounding box visualization
✅ Grid and axis helpers

3.2 PRICING & COST ESTIMATION
------------------------------------------------------------
✅ Process selection (FDM, SLA, SLS, MJF)
✅ Material selection (with density-aware weight calculation)
✅ Manual weight input override
✅ Auto-estimate from mesh volume
✅ Per-material cost modifiers
✅ Transparent cost breakdown display

3.3 ORDER FLOW
------------------------------------------------------------
✅ Add to order preview (with weight + cost)
✅ Checkout page (order summary + shipping form)
✅ Payment page (mock card/UPI/netbanking UI)
✅ Order success page
✅ Order confirmation email API route (simulated, console logs)
✅ Zustand store for order state management

3.4 SEO & SECURITY
------------------------------------------------------------
✅ Metadata (OpenGraph, Twitter cards)
✅ generateViewport() for Next.js 14 compliance
✅ Security headers (CSP, X-Frame-Options, etc.)
✅ robots.txt
✅ sitemap.xml

3.5 BUILD & DEPLOYMENT CONFIG
------------------------------------------------------------
✅ Turborepo pipeline (renamed from `pipeline` to `tasks` for v2.7+)
✅ pnpm workspace setup
✅ Vercel deployment config (apps/web/vercel.json)
✅ Render deployment config (apps/engine: Python 3.11, uvicorn)
✅ Environment variables templated (.env.example)

================================================================================
4. DEPLOYMENT HISTORY & ATTEMPTS
================================================================================

4.1 BACKEND (ENGINE) - RENDER
------------------------------------------------------------
Platform: Render (https://render.com)
Service: ecom-idmq (Web Service, free tier)
Live URL: https://ecom-idmq.onrender.com

Timeline of fixes:
  1. Initial deploy failed: Root Directory set to wrong path
     → Fixed: Set Root Directory to `apps/engine`
  
  2. Build failed: Python 3.13 + Rust compilation issues (pydantic-core)
     → Fixed: Added `.python-version` file (3.11.7) to force Python 3.11
  
  3. Dependency resolution failed: Rust-compiled wheels unavailable
     → Fixed: Used wheel-compatible package versions:
       - numpy==1.26.4
       - trimesh==4.5.3
       - pydantic==2.10.6
  
  4. Start command incorrect: Render defaulted to `gunicorn`
     → Fixed: Set start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`
  
  5. Final status: ✅ DEPLOYED SUCCESSFULLY (Jan 7, 2026)
     Health check: curl https://ecom-idmq.onrender.com/health → 200 OK

4.2 FRONTEND (WEB) - VERCEL
------------------------------------------------------------
Platform: Vercel (https://vercel.com)
Project: eshant-3d
Target URL: https://eshant-3d.vercel.app

Timeline of attempts:

Attempt 1-5: Root directory confusion
  - Issue: Vercel project settings pointed to `apps/engine` (wrong service)
  - Tried: Multiple CLI relinks, config changes
  - Result: ❌ Error "No fastapi entrypoint found"

Attempt 6-8: Framework detection issues
  - Issue: Vercel couldn't find Next.js in root package.json (monorepo)
  - Tried: Set `framework: null` in vercel.json
  - Result: ⚠️ Built but served static files only (404 on all routes)

Attempt 9-12: Root directory + monorepo config
  - Issue: Deploying from `apps/web` only uploads that subfolder (missing workspace files)
  - Tried: 
    a) Deploy from root with `outputDirectory: apps/web/.next`
    b) Set Root Directory to `apps/web` in dashboard + enable "Include files outside root"
  - Result: ❌ Multiple region error (Pro plan required), missing env secrets

Attempt 13-15: Install command failures
  - Issue: `pnpm install` on Vercel hit transient registry errors (ERR_INVALID_THIS)
  - Tried:
    a) Reduce network concurrency: `pnpm install --network-concurrency=1 --fetch-retries=5`
    b) Fallback to npm: `npm ci` (failed: no package-lock.json in monorepo subdirectory)
    c) Fallback to npm: `npm install --legacy-peer-deps`
  - Result: ⏳ IN PROGRESS (Jan 9, 2026, ongoing)

Current Status (as of Jan 9, 2026):
  - Deployment: ⏳ PENDING (npm install running, may succeed or fail)
  - If fails: Next step is client-side analysis (remove engine dependency)

Root causes of deployment issues:
  1. Monorepo complexity (Vercel prefers single-app repos)
  2. Transient npm registry network issues
  3. Turbo v2.7 breaking change (`pipeline` → `tasks`)
  4. Next.js 14 metadata viewport deprecation
  5. Vercel free tier limits (regions, build time)

================================================================================
5. KNOWN ISSUES & WORKAROUNDS
================================================================================

5.1 Vercel Deployment (Ongoing)
------------------------------------------------------------
Issue: npm registry transient errors during `npm install`
Symptoms: "GET https://registry.npmjs.org/... error (ERR_INVALID_THIS)"
Workarounds attempted:
  - Retry with delays
  - Reduce concurrency
  - Use npm instead of pnpm
Status: Monitoring current deploy

5.2 Engine CORS (Resolved)
------------------------------------------------------------
Issue: Browser blocked engine requests from localhost
Fix: Added CORS middleware in FastAPI main.py

5.3 Metadata Viewport Warnings (Resolved)
------------------------------------------------------------
Issue: Next.js 14 deprecated `viewport` in metadata export
Fix: Moved to `generateViewport()` function in layout.tsx

5.4 Turbo Pipeline Rename (Resolved)
------------------------------------------------------------
Issue: Turbo v2.7+ requires `tasks` instead of `pipeline`
Fix: Renamed field in turbo.json

================================================================================
6. ARCHITECTURE DECISIONS & RATIONALE
================================================================================

6.1 Why Monorepo?
------------------------------------------------------------
Pro: Shared types, unified builds, easier local dev
Con: Deployment complexity (each platform wants single app)

6.2 Why FastAPI Engine?
------------------------------------------------------------
Pro: Python trimesh is mature, accurate geometry analysis
Con: Separate deploy, CORS issues, added complexity

6.3 Why Zustand over Redux?
------------------------------------------------------------
Pro: Simpler, less boilerplate, React-first
Con: Less tooling/devtools

6.4 Why Mock Payments?
------------------------------------------------------------
Pro: Avoid PCI compliance for demo
Con: Not production-ready (need Stripe/Razorpay integration)

================================================================================
7. SECURITY & COMPLIANCE
================================================================================

7.1 PCI DSS Readiness
------------------------------------------------------------
Document: PCI_README.md
Current: Mock payment only (no card data handled)
Future: Use hosted checkout (Stripe/Razorpay) to reduce PCI scope

7.2 Content Security Policy
------------------------------------------------------------
Configured in next.config.js:
  - Allows Three.js CDN
  - Allows Stripe/Razorpay frame embedding
  - Restricts inline scripts (uses 'unsafe-eval' for Three.js)

7.3 Environment Variables
------------------------------------------------------------
Required:
  - NEXT_PUBLIC_SITE_URL (frontend URL)
  - NEXT_PUBLIC_ENGINE_URL (backend API URL)

Configured in:
  - apps/web/vercel.json (hardcoded for Vercel)
  - .env.local (local dev)

================================================================================
8. TESTING & VALIDATION
================================================================================

8.1 Local Build
------------------------------------------------------------
Command: pnpm install && pnpm build
Status: ✅ PASSING (as of Jan 9, 2026)
Output: Clean build, only metadata viewport warnings (now fixed)

8.2 Production URLs
------------------------------------------------------------
Backend: https://ecom-idmq.onrender.com (✅ live)
Frontend: https://eshant-3d.vercel.app (⏳ pending successful deploy)

8.3 Manual Testing Checklist
------------------------------------------------------------
- [ ] Upload STL file
- [ ] View 3D model
- [ ] Rotate and orient model
- [ ] Select process and material
- [ ] Auto-calculate weight
- [ ] Preview order
- [ ] Checkout
- [ ] Mock payment
- [ ] Receive confirmation
- [ ] Email sent (console log)

================================================================================
9. FUTURE IMPROVEMENTS & ROADMAP
================================================================================

9.1 Immediate (resolve deployment)
------------------------------------------------------------
- [ ] Successful Vercel deploy
- [ ] End-to-end smoke test
- [ ] Document final deployment steps

9.2 Short-term (production readiness)
------------------------------------------------------------
- [ ] Real payment integration (Stripe/Razorpay)
- [ ] Email provider integration (SendGrid/Resend)
- [ ] Database persistence (Prisma + PostgreSQL)
- [ ] User authentication (NextAuth.js)
- [ ] Admin dashboard (order management)

9.3 Long-term (scale & features)
------------------------------------------------------------
- [ ] Multi-file batch upload
- [ ] Design rule checking (DRC)
- [ ] Instant quote API
- [ ] Customer portal
- [ ] Print farm integration
- [ ] Automated slicing
- [ ] Real-time order tracking

================================================================================
10. CLIENT-SIDE ANALYSIS OPTION (ALTERNATIVE TO ENGINE)
================================================================================

10.1 Motivation
------------------------------------------------------------
- Remove backend dependency (simpler deployment)
- Faster analysis (no network round-trip)
- Works offline
- Zero hosting cost for backend

10.2 Technical Approach
------------------------------------------------------------
Use Three.js BufferGeometry to:
  - Compute bounding box (already available)
  - Calculate volume (signed volume of triangles)
  - Estimate surface area (sum of triangle areas)
  - Derive weight from volume × material density

10.3 Implementation Plan (if needed)
------------------------------------------------------------
1. Add geometry math functions to Viewer3D.tsx
2. Calculate metrics after STL/GLB loads into Three.js
3. Update OrderSummary to use local metrics
4. Remove engine API calls
5. Keep engine code in repo (not deleted, just unused)

10.4 Security Consideration
------------------------------------------------------------
Q: "How can user manipulate pricing?"
A: With client-side calculation, user can:
   - Open DevTools → Console
   - Call `orderStore.setState({ weightCost: 0 })`
   - Modify pricing variables in memory
   
   For production: validate pricing server-side at checkout.
   For hobby/demo: acceptable risk.

10.5 Performance Consideration
------------------------------------------------------------
Q: "Why will it be slower? Grabcad renders fast."
A: Good point! Client-side isn't necessarily slower:
   
   Grabcad/Thingiverse approach:
   - Parse STL in Web Worker (non-blocking)
   - Use GPU (WebGL) for rendering (already doing this)
   - Geometry math is fast (<100ms for most models)
   
   Slow cases:
   - Very large files (>50MB) on low-end devices
   - Complex boolean operations (not needed here)
   - Initial parse + first render (one-time cost)
   
   Reality: For typical STL files (<10MB), client-side
   processing is FASTER than network round-trip to engine.

================================================================================
11. MODIFICATIONS LOG
================================================================================

[2026-01-09] Initial Implementation History Created
- Documented full project architecture
- Recorded all deployment attempts and fixes
- Listed known issues and workarounds
- Outlined future roadmap

--- FUTURE MODIFICATIONS WILL BE APPENDED BELOW THIS LINE ---

================================================================================
END OF DOCUMENT
================================================================================
