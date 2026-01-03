# Eshant Ecommerce Platform

A **production-grade 3D printing ecommerce platform** designed with manufacturing engineering principles. Not a toy. Not a gallery. A feasibility checker, cost estimator, and order system that respects constraints.

## Architecture

### Apps
- **`apps/web`** — Next.js 14 frontend + API routes (React, Three.js, Tailwind CSS)

### Packages
- **`packages/db`** — Prisma ORM + PostgreSQL schema (materials, processes, tolerances, orders)
- **`packages/api`** — tRPC routers (geometry analysis, pricing, feasibility)

### Services (future)
- **`apps/engine`** — Python microservice for geometry processing + complexity analysis + slicing integration

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| 3D | Three.js, React Three Fiber |
| API | tRPC (type-safe), Prisma ORM |
| Database | PostgreSQL |
| State | Zustand |
| Build | Turborepo |
| Styling | Tailwind + premium glassmorphic aesthetic |

## Project Structure

```
.
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/
│   │   │   ├── page.tsx    # Corporate homepage (SpaceX-style)
│   │   │   └── estimator/  # Manufacturing console
│   │   ├── components/      # UI (FileUpload, Viewer3D, etc.)
│   │   ├── lib/            # State (Zustand), utilities
│   │   └── globals.css     # Premium styling
│   └── engine/             # Python geometry + pricing engine
├── packages/
│   ├── db/                 # Prisma schema
│   │   └── prisma/
│   │       └── schema.prisma
│   └── api/                # tRPC routers
│       └── src/
│           ├── trpc.ts
│           ├── routers/
│           │   ├── geometry.ts
│           │   └── pricing.ts
│           └── index.ts
├── package.json            # Monorepo root
├── turbo.json             # Turborepo config
└── Dockerfile             # Docker build
```

## Setup

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL 14+

### Installation

```bash
# Install dependencies across monorepo
pnpm install

# Create .env for database
cp packages/db/.env.example packages/db/.env

# Push schema to database
cd packages/db && pnpm db:push

# Start development
cd ../.. && pnpm dev
```

Opens:
- Web: http://localhost:3000

## Core Features

### 1. Geometry-First Entry
Upload STEP/STL/OBJ files. System automatically extracts:
- Bounding box, volume, surface area
- Complexity index
- Thin-wall detection
- Overhang warnings

### 2. Manufacturing Configuration
User selects, in order:
1. **Process** (FDM, SLA, SLS, MJF, Metal)
2. **Material** (filtered by process)
3. **Tolerance class** (affects cost + lead time)
4. **Quantity**
5. **Finish level**

### 3. Feasibility Gating
Before pricing, system checks:
- Geometry fits machine envelope?
- Material supports this process?
- Minimum wall thickness OK?
- Tolerance achievable?

Failures block ordering with clear reason + suggestions.

### 4. Transparent Pricing
Cost breakdown displayed:
```
Material:        ₹12.50 (15%)
Machine Time:    ₹45.00 (54%)
Setup:           ₹10.00 (12%)
Post-Processing: ₹5.00 (6%)
QA:              ₹2.00 (2%)
─────────────────────────
Total:           ₹85.68
```

### 5. Lead Time Bands
Not promises—queues.
```
Economy:   2026-01-10 (8 days)
Standard:  2026-01-07 (5 days) +15% cost
Priority:  2026-01-05 (3 days) +40% cost
```

### 6. 3D Viewer
- Inspection tool, not spectacle
- Rotate, zoom, pan
- Highlight constraints (thin walls, overhangs)
- Show orientation impact

## Database Schema (Prisma)

Core entities:
- **Users** — tier system (STANDARD, PROFESSIONAL, ENTERPRISE)
- **Materials** — density, cost/gram, min wall thickness, properties
- **Processes** — machine rate, envelope, tolerances
- **ToleranceClass** — STANDARD/TIGHT/CRITICAL with multipliers
- **UploadedFile** — geometry metrics, warnings, hash
- **Order** — configuration + cost + status tracking

All costs in database are normalized. Real pricing = formula + material data + complexity factor.

## Design Philosophy

**This is not ecommerce. This is a manufacturing estimator with a UI.**

Key principles:
- **Clarity over conversion** — every number is justified
- **Constraint-first** — prevent bad orders, not attract bad customers
- **Engineering tone** — technical, declarative, unemotional
- **Progressive disclosure** — only show what's relevant at each step
- **Operational transparency** — what the site promises, the factory delivers

## Next Steps

### Immediate
1. Integrate tRPC into frontend (currently mocked)
2. Connect to PostgreSQL
3. Implement Three.js viewer with constraint visualization
4. Add authentication (optional, for portfolio mode)

### Geometry Engine
1. Implement Python microservice for STL/STEP parsing
2. Compute complexity index algorithm
3. Integrate slicer (PrusaSlicer, CuraEngine)
4. Validate against machine constraints

### Pricing Algorithm
1. Define cost model per process/material
2. Complexity-based time estimation
3. Queue depth calculation
4. Real lead-time prediction

### Operations
1. Order → manufacturing summary (PDF)
2. Integration with production scheduling
3. QA checklist generation
4. Customer tracking + status updates

---

**Built for billions. Every number counts.**
# ecom
