# Quick Start Guide

## Install & Run (5 minutes)

### Prerequisites
- **Node.js** 18+ ([install](https://nodejs.org))
- **pnpm** `npm install -g pnpm`
- **Docker** ([install](https://docker.com))

### Steps

1. **Clone & enter workspace**
   ```bash
   cd /Users/pandeyji/Desktop/Eshant_Ecommerce
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start database + engine + web (all in one)**
   ```bash
   docker-compose up
   ```
   
   Wait for:
   ```
   ✓ postgres is running
   ✓ engine is running (uvicorn on :8000)
   ✓ web is running (next on :3000)
   ```

4. **Open in browser**
   - **Homepage**: http://localhost:3000
   - **Estimator**: http://localhost:3000/estimator
   - **Engine health**: http://localhost:8000/docs (Swagger)

---

## What Works Now

✅ **Corporate homepage** — SpaceX-style minimal design
✅ **File upload** — Drag-drop with validation
✅ **Geometry display** — Auto-extracted metrics (bounding box, volume, etc.)
✅ **Process/material picker** — Progressive disclosure UI
✅ **Cost visualization** — Stacked breakdown (mocked)
✅ **Mobile responsive** — Full support

🔲 **Real 3D viewer** — Three.js component needs mesh data integration
🔲 **Live API** — tRPC routes are scaffolded, not integrated into UI yet
🔲 **Pricing algorithm** — Structure exists, needs implementation
🔲 **Database** — Schema exists, not populated

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `apps/web/app/page.tsx` | Corporate homepage |
| `apps/web/app/estimator/page.tsx` | Main estimator (single screen) |
| `apps/web/lib/store.ts` | State management (Zustand) |
| `apps/web/components/*.tsx` | UI components (FileUpload, Viewer3D, etc.) |
| `packages/api/src/routers/*.ts` | Backend logic (geometry, pricing) |
| `apps/engine/main.py` | Geometry processing microservice |
| `packages/db/prisma/schema.prisma` | Database schema |

---

## Development Workflow

### Start everything
```bash
docker-compose up
```

### Hot reload (separate terminal)
```bash
cd apps/web && pnpm dev
```

### Make a change
- Edit a `.tsx` file → auto-refresh in browser
- Edit `packages/api/` → restart web service
- Edit Python → restart engine service

### Stop
```bash
docker-compose down
```

---

## Next: Connect Real API

The frontend currently mocks data. To connect to real API:

### 1. Create tRPC client
```typescript
// apps/web/lib/api.ts
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@eshant/api";

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_API_URL + "/api/trpc",
    }),
  ],
});
```

### 2. Use in components
```typescript
// Before: mock
const { setCostEstimate } = useEstimator();
setTimeout(() => setCostEstimate(85.68, {...}), 2000);

// After: real
const result = await api.pricing.estimateCost.query({...});
setCostEstimate(result.total, result.breakdown);
```

---

## Customize for Your Business

### 1. Change company name
- `apps/web/app/page.tsx` → "ESHANT" to your brand
- `apps/web/app/layout.tsx` → metadata title

### 2. Add real processes/materials
- `packages/db/prisma/schema.prisma` → Already designed for this
- Add seed data in `packages/db/prisma/seed.ts`

### 3. Adjust pricing logic
- `packages/api/src/routers/pricing.ts` → Implement real algorithm
- Connect to `apps/engine` for print time estimation

### 4. Branding
- `apps/web/tailwind.config.js` → Color palette (change accent-purple to your color)
- `apps/web/globals.css` → Custom utilities

---

## Support

### Common Issues

**Q: "Cannot find module '@eshant/api'"**
```bash
# Make sure all packages are installed
pnpm install
```

**Q: "PostgreSQL connection failed"**
```bash
# Ensure docker-compose is running and DB is healthy
docker-compose ps
docker-compose logs db
```

**Q: "Port 3000 already in use"**
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill
```

---

## Architecture at a Glance

```
Frontend (Next.js)
    ↓ (tRPC)
Backend (Node API)
    ↓ (HTTP)
Engine (Python FastAPI)
    ↓
Database (PostgreSQL)
```

Each service runs independently. Scale any layer without affecting others.

---

## You're Ready

Homepage is live. Estimator is interactive. API is structured.

**Next step**: Implement pricing algorithm + connect real geometry analysis.

Questions? See `ARCHITECTURE.md` for deep dive.
