# Eshant Ecommerce — Complete Platform Architecture

## What Was Built

A **production-grade 3D printing manufacturing platform** designed for serious customers (engineers, R&D teams, labs, startups) who deal in precision and billions of rupees in revenue.

### Key Principle
> **By the time money exchanges hands, uncertainty is already eliminated.**

---

## Tech Stack Choices (Why)

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend Framework** | Next.js 14 (App Router) | Server components, streaming, mobile-first, SEO-ready |
| **UI Library** | Tailwind CSS + custom components | Fast, minimal, premium aesthetic without bloat |
| **3D Viewer** | Three.js + React Three Fiber | Industry standard, performant, inspection-grade (not spectacle) |
| **State Management** | Zustand | Lightweight, TypeScript-native, no Redux ceremony |
| **API Layer** | tRPC | Type-safe, no version management, single source of truth |
| **Database** | PostgreSQL + Prisma | Relational, proven for manufacturing/orders, excellent ORM |
| **Geometry Engine** | Python (FastAPI) | NumPy/Trimesh for 3D geometry, slicing integrations, separate service |
| **Build System** | Turborepo + monorepo | Scalable, fast builds, shared packages across apps |
| **Containerization** | Docker + docker-compose | Production-ready, dev parity, microservices-ready |

---

## Project Structure

```
Eshant_Ecommerce/
├── apps/
│   ├── web/                                # Next.js manufacturing console + corporate site
│   │   ├── app/
│   │   │   ├── page.tsx                   # Corporate homepage (SpaceX-style minimal)
│   │   │   └── estimator/
│   │   │       └── page.tsx               # Main estimator (single-screen control surface)
│   │   ├── components/
│   │   │   ├── FileUpload.tsx             # Drag-drop geometry ingestion
│   │   │   ├── Viewer3D.tsx               # Three.js preview + constraint viz
│   │   │   ├── GeometryInfo.tsx           # Auto-derived metrics display
│   │   │   ├── Configuration.tsx          # Process → Material → Tolerance picker
│   │   │   └── CostBreakdown.tsx          # Stacked cost visualization
│   │   ├── lib/
│   │   │   └── store.ts                   # Zustand estimator state
│   │   ├── globals.css                    # Premium aesthetic + custom utilities
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── engine/                             # Python geometry processing microservice
│       ├── main.py                         # FastAPI server (analyze, feasibility, etc.)
│       ├── requirements.txt                # fastapi, trimesh, numpy, uvicorn
│       ├── Dockerfile
│       └── package.json                    # (for consistency)
│
├── packages/
│   ├── db/                                 # Database schemas + migrations
│   │   ├── prisma/
│   │   │   └── schema.prisma              # Complete ORM schema (see below)
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── api/                                # tRPC routers (type-safe backend)
│       ├── src/
│       │   ├── trpc.ts                    # tRPC base configuration
│       │   ├── routers/
│       │   │   ├── geometry.ts            # analyze, checkFeasibility, getPreviewMesh
│       │   │   └── pricing.ts             # estimateCost, getLeadTimes
│       │   └── index.ts                   # AppRouter export
│       ├── tsconfig.json
│       └── package.json
│
├── docker-compose.yml                      # Local dev: PostgreSQL + Engine + Web
├── Dockerfile                              # Production web build
├── package.json                            # Monorepo root + Turborepo config
├── turbo.json                              # Build pipeline
├── .gitignore
└── README.md
```

---

## Database Schema (Prisma)

```
Users
├─ id, email, name, company
├─ tier (STANDARD | PROFESSIONAL | ENTERPRISE)
└─ orders → Order[]

Materials
├─ id, name, density (g/cm³), costPerGram
├─ process → Process
├─ minWallThickness, maxTemp
└─ properties [] (e.g., "flex", "heat-resistant")

Processes
├─ id, name (FDM | SLA | SLS | MJF | METAL)
├─ machineHourlyRate, minFeatureSize
├─ maxBuildEnvelope, supportRequired
└─ materials → Material[]

ToleranceClass
├─ id, name (STANDARD | TIGHT | CRITICAL)
├─ process → Process
├─ tolerance (±mm), costMultiplier, leadTimeBonus

UploadedFile
├─ id, fileName, fileHash (unique)
├─ user → User
├─ boundingBox, volume, surfaceArea, estimatedMass
├─ complexityIndex, hasOverhangs, minWallThickness
├─ warnings [] (auto-derived)
└─ orders → Order[]

Order
├─ id, user → User, file → UploadedFile
├─ process → Process, material → Material, tolerance → ToleranceClass
├─ quantity, finishLevel (AS_PRINTED | CLEANED | MACHINED | POLISHED | PAINTED)
├─ materialCost, machineTimeCost, setupCost, postProcessingCost, qaCost, totalCost
├─ queueDepth, estimatedPrintTime, estimatedLeadTime
├─ status (PENDING_PAYMENT → CONFIRMED → SLICING → ... → DELIVERED)
└─ manufacturingNotes?
```

**Why this schema?**
- Captures **engineering reality** (tolerances, processes, material constraints)
- Supports **transparent pricing** (all cost components stored)
- Enables **operational tracking** (queue depth, lead time, status)
- Allows **portfolio analysis** (tier system, order history)

---

## Frontend Component Hierarchy

```
Layout (global)
└── page.tsx (Corporate: hero + features + CTA)
└── estimator/page.tsx
    ├── Left Column (1/3)
    │   ├── Configuration
    │   │   ├── FileUpload (if no file)
    │   │   ├── Configuration (if file)
    │   │   │   ├── Process selector
    │   │   │   ├── Material selector (filtered by process)
    │   │   │   ├── Tolerance class (3-button toggle)
    │   │   │   └── Quantity slider
    │   │   └── (locked sections unlock progressively)
    │   │
    │   └── CostBreakdown (appears once config locked)
    │       ├── Material cost
    │       ├── Machine time
    │       ├── Setup
    │       ├── Post-processing
    │       ├── QA
    │       └── Total (per unit + bulk)
    │
    └── Right Column (2/3)
        ├── Viewer3D
        │   ├── Three.js canvas
        │   ├── Rotate / Show Warnings / Orientation buttons
        │   └── Constraint overlays (thin walls in red, overhangs in amber)
        │
        └── GeometryInfo
            ├── Bounding box
            ├── Volume
            ├── Estimated mass
            ├── Surface area
            ├── Complexity level
            └── Warnings (auto-derived from analysis)
```

**State Flow (Zustand store)**
```
UploadedFile → (auto-lock Configuration section)
Process selected → (filter Materials)
Material selected → (unlock Tolerance)
Tolerance selected → (compute cost via API)
Cost received → (display CostBreakdown)
Quantity changed → (recompute total)
```

---

## API Routes (tRPC)

### Geometry Router
```
POST /geometry/analyze
  Input: fileHash, fileName, fileData (buffer)
  Output: {
    boundingBox, volume, surfaceArea, estimatedMass,
    featureCount, complexityIndex, hasOverhangs, minWallThickness,
    warnings []
  }

GET /geometry/checkFeasibility
  Input: fileHash, processId, materialId, toleranceClass
  Output: {
    feasible, blockers [], warnings [],
    recommendedOrientation, estimatedSupportVolume
  }

GET /geometry/getPreviewMesh
  Input: fileHash
  Output: { vertices [], faces [], normals [] }  # low-poly
```

### Pricing Router
```
GET /pricing/estimateCost
  Input: fileHash, processId, materialId, quantity, toleranceClass, finishLevel
  Output: {
    materialCost, machineTimeCost, setupCost, postProcessingCost, qaCost,
    subtotal, tax, total, costPerUnit,
    breakdown { material: "₹12.50 (15%)", ... }
  }

GET /pricing/getLeadTimes
  Input: processId, materialId, estimatedPrintTime
  Output: {
    economy { label, estimatedDispatch, leadDays, costMultiplier, description },
    standard { ... },
    priority { ... }
  }
```

---

## Python Engine (`apps/engine/main.py`)

**Current**: Mock endpoints returning realistic structure.

**Real implementation** integrates:
1. **Trimesh** — Parse STEP/STL/OBJ, compute metrics
2. **NumPy** — Geometry calculations (volume, surface area, curvature)
3. **PrusaSlicer / CuraEngine** — Estimate support volume, print time
4. **Custom logic** — Complexity index, feasibility checking

```python
@app.post("/analyze")
async def analyze_geometry(file: UploadFile):
    # Parse mesh, extract metrics
    # Return GeometryMetrics

@app.post("/feasibility")
async def check_feasibility(fileHash, processId, materialId, tolerance):
    # Check against process capability matrix
    # Return FeasibilityResult

@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

## Styling Philosophy

**Premium, minimal, restrained.**

- **Color palette**: Slate (neutral) + Accent purple (purposeful)
- **Shadows**: Soft, 8px blur (premium-shadow class)
- **Typography**: Sans (system fonts) + Mono (code)
- **Spacing**: 4px grid, generous padding
- **Interactions**: Subtle transitions (200ms), no animations (except spinner)
- **Responsive**: Mobile-first, full desktop optimization

**What it avoids:**
- Gradients (except subtle bg)
- Glows or shadows (except premium-shadow)
- Animations (except loading spinner)
- Marketing copy (only technical descriptions)

Result: Feels like **manufacturing software, not a marketing site**.

---

## Environment Variables

**`.env.local` (development)**
```
DATABASE_URL=postgresql://eshant:eshant_dev_password@localhost:5432/eshant
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**`.env.production` (deployed)**
```
DATABASE_URL=postgresql://[production-db]
NEXT_PUBLIC_API_URL=https://api.eshant.io
```

---

## How to Get Started

### 1. Development

```bash
# Install dependencies
pnpm install

# Copy env examples
cp packages/db/.env.example packages/db/.env
cp apps/web/.env.example apps/web/.env.local

# Start services (database + engine + web)
docker-compose up

# In parallel terminal: watch builds
pnpm dev

# Web: http://localhost:3000
# Engine: http://localhost:8000
# Database: localhost:5432
```

### 2. First Feature: Connect tRPC

Frontend currently mocks data. To connect:

1. Update `apps/web/lib/api.ts` (create tRPC client)
2. Export hooks in `hooks/useGeometry.ts`, `hooks/usePricing.ts`
3. Replace mock calls in components with real API calls

### 3. Implement Pricing Algorithm

1. Define cost model in `packages/api/src/pricing-engine.ts`
2. Implement complexity factor calculation
3. Integrate support volume estimation from Python engine
4. Add lead-time queue management

### 4. Build Three.js Viewer

1. Create `components/Viewer3DImpl.tsx` (React Three Fiber)
2. Load preview mesh from `/geometry/getPreviewMesh`
3. Highlight constraint zones (thin walls, overhangs)
4. Add rotation guides for optimal orientation

---

## Deployment Options

### Docker (Recommended)
```bash
docker-compose build
docker-compose up
```

### Kubernetes (Future)
- Separate services for web, engine, database
- Autoscaling based on queue depth
- CI/CD integration (GitHub Actions)

### Cloud (AWS / Azure / GCP)
- Next.js → App Runner / App Service
- Python → Lambda / Cloud Run
- PostgreSQL → RDS / Cloud SQL

---

## Why This Architecture Works

### 1. **Separation of Concerns**
- Frontend knows only about UI state
- tRPC routes orchestrate business logic
- Python engine handles geometry (heavy compute)
- Database is source of truth

### 2. **Type Safety**
- Prisma → Automatic schema types
- tRPC → API contract validation
- TypeScript everywhere → Fewer bugs

### 3. **Scalability**
- Monorepo → easy code sharing
- Microservices → Python engine can scale independently
- Database is bottleneck, not frontend

### 4. **DX (Developer Experience)**
- Hot reload in all layers
- Single `pnpm dev` starts everything
- TypeScript catches 70% of bugs before runtime

### 5. **Customer Communication**
- Clear pricing (no hidden costs)
- Feasibility gates (no surprise failures)
- Status tracking (transparent operations)

---

## Next Immediate Actions

1. **Polish UI** — Connect real data, refine spacing, test mobile
2. **Implement pricing** — Define algorithm, integrate material costs
3. **Build 3D viewer** — React Three Fiber implementation
4. **Add authentication** — Optional (portfolio mode works without it)
5. **Deploy** — Docker image to cloud
6. **Process library** — Populate FDM/SLA/SLS/MJF/Metal with real constraints

---

## Final Philosophy

This is **not a shopping cart with 3D printing bolted on**.

It is a **manufacturing estimator that happens to process orders**.

Every design decision reflects that:
- **Geometry first** (not catalog)
- **Constraints visible** (not hidden)
- **Cost transparent** (not padded)
- **Tone technical** (not marketing)
- **Tone engineering** (not sales)

This attracts serious repeat customers who care about precision, cost, and reliability.

It quietly repels bargain hunters and unrealistic hobbyists.

**That is the point.**

---

Built for engineers. Designed like manufacturing. Scaled for billions.
