# **Deployment Guide: Vercel + Free Backend + Free Domain**

## **TL;DR — What you get (all FREE):**
- Frontend on **Vercel** (unlimited free tier)
- Backend (FastAPI) on **Render** free tier (sleeps after 15 min, free for testing)
- Free subdomain or custom domain pointing to Vercel
- HTTPS/SSL automatic
- SEO & security compliance built-in

---

## **Cost Breakdown (Monthly)**

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel (Frontend) | Yes | $0 |
| Render (Backend) | Yes (sleeps) | $0 |
| Domain (.tk/.ml) | Yes (Freenom) | $0 |
| HTTPS | Automatic | $0 |
| **TOTAL** | | **$0/month** |

> **Upgrade later:** Render paid = $7/mo (keeps backend awake), .com domain = ~$10/yr

---

## **Step 1: Deploy Frontend to Vercel (5 minutes)**

### **Prerequisites:**
- GitHub repo pushed ✓ (you have this)
- Vercel account (free: https://vercel.com/signup)

### **Instructions:**

1. **Go to** https://vercel.com/new
2. **Import your GitHub repo** (`pandeyji/ecom`)
3. **Configure:**
   - Framework: Next.js ✓
   - Root Directory: `apps/web` ← **IMPORTANT**
   - Build Command: `cd ../.. && pnpm turbo run build --filter=web`
   - Output: `.next`

4. **Environment Variables** (Vercel dashboard → Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SITE_URL = https://<your-vercel-domain>.vercel.app
   NEXT_PUBLIC_ENGINE_URL = https://<your-render-backend>.onrender.com
   ```
   (You'll get these URLs after next step)

5. **Deploy** — click "Deploy" and wait 2–3 min ✓

**Result:** Your app is live at `https://<random-name>.vercel.app`

---

## **Step 2: Deploy Backend (FastAPI) to Render (10 minutes)**

> Why Render? Free tier, easy, supports Python, auto-deploy from GitHub.

### **Prerequisites:**
- Render account (free: https://render.com)
- GitHub repo with `/apps/engine` pushed ✓

### **Instructions:**

1. **Create a new Web Service:**
   - Go to https://dashboard.render.com/new/webservice
   - Connect your GitHub repo
   - Select `ecom` repo

2. **Configure:**
   - **Name:** `eshant-engine` (or any name)
   - **Root Directory:** `apps/engine`
   - **Runtime:** Python 3
   - **Build Command:**
     ```
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```
     uvicorn main:app --host 0.0.0.0 --port 10000
     ```

3. **Environment Variables:**
   - `ALLOWED_ORIGINS=https://<your-vercel-domain>.vercel.app,http://localhost:3000` (for local testing)

4. **Pricing:** Select **Free** tier (auto-sleeps after 15 min inactivity)

5. **Deploy** — Render auto-deploys from GitHub ✓

**Result:** Backend at `https://eshant-engine.onrender.com`

> **Note:** Free tier sleeps after 15 min. First request takes ~20s to wake up. Upgrade to $7/mo to keep it always-on.

---

## **Step 3: Add Free Domain (5 minutes)**

### **Option A: Free Subdomain (Easiest)**

1. In Vercel dashboard → Settings → Domains
2. Add custom domain: `eshant3d.vercel.app` (auto-provided)
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars

**Result:** https://eshant3d.vercel.app (live in <1 min)

### **Option B: Free Domain + Point to Vercel (10 minutes)**

1. **Get free .tk domain** (Freenom.com):
   - Go to https://www.freenom.com
   - Search "eshant3d.tk"
   - Register (free for 12 months)
   - Note down the registrar nameservers

2. **Point to Vercel** (Vercel → Settings → Domains):
   - Add custom domain: `eshant3d.tk`
   - Vercel gives you nameserver instructions
   - Go to Freenom → Manage Domain → Nameservers
   - Replace with Vercel's nameservers
   - Wait 5–30 min for DNS propagation

3. **Update env vars** in Vercel:
   ```
   NEXT_PUBLIC_SITE_URL = https://eshant3d.tk
   ```

**Result:** https://eshant3d.tk (live after DNS propagates)

---

## **Step 4: Connect Frontend to Backend**

1. **In Vercel dashboard:**
   - Go to deployed project
   - Settings → Environment Variables
   - Add/update:
     ```
     NEXT_PUBLIC_ENGINE_URL = https://eshant-engine.onrender.com
     ```
   - Redeploy (Re-run Build)

2. **Test:**
   - Upload STL file on https://eshant3d.tk/estimator
   - Should load 3D model and analyze geometry ✓

---

## **Step 5: Connect Backend to Custom Domain (Optional)**

If you want `api.eshant3d.tk` instead of `eshant-engine.onrender.com`:

1. In Render dashboard → Web Service → Custom Domain
2. Add: `api.eshant3d.tk`
3. Render gives you CNAME record
4. Go to Freenom → Manage Domain → CNAME
5. Add CNAME record (wait 5–30 min)

**Update env var in Vercel:**
```
NEXT_PUBLIC_ENGINE_URL = https://api.eshant3d.tk
```

---

## **SEO Compliance ✓**

What we added:

1. **Meta Tags:** Title, description, keywords, OpenGraph (Twitter, LinkedIn)
2. **Sitemap:** `/sitemap.xml` — auto-generated
3. **Robots.txt:** `/robots.txt` — tells Google to index
4. **Structured Data:** Schema.org (JSON-LD in meta tags)
5. **Mobile-friendly:** Responsive + viewport meta
6. **Fast:** Next.js image optimization + Vercel CDN

**Submit to Google:**
1. Google Search Console: https://search.google.com/search-console
2. Add property: `https://eshant3d.tk`
3. Verify (via DNS or HTML file)
4. Submit sitemap: `/sitemap.xml`
5. Check "Mobile Usability" → should be 100% ✓

---

## **Security Compliance ✓**

What we added:

1. **HTTPS/SSL:** Automatic (Vercel + Render)
2. **Security Headers:**
   - `X-Content-Type-Options: nosniff` — prevent MIME sniffing
   - `X-Frame-Options: SAMEORIGIN` — prevent clickjacking
   - `Content-Security-Policy` — whitelist scripts/styles
3. **No server info leak:** Removed `X-Powered-By`
4. **Input validation:** Already in place (checkout form)
5. **CORS:** FastAPI has `allow_origins` config

**For PCI Compliance (if accepting real payments):**
- Never store card data (use Stripe/Razorpay checkout) ← We set this up
- Use HTTPS everywhere ✓
- Log access ← Render + Vercel auto-log
- Scan for vulnerabilities (free: https://snyk.io)

---

## **Troubleshooting**

### **"3D model fails to load"**
- Check `NEXT_PUBLIC_ENGINE_URL` is correct in Vercel
- Render backend might be asleep → wake it up by visiting `/health`
- CORS issue? → Backend's `allow_origins` should include Vercel domain

### **"Domain not working after 30 min"**
- DNS might not have propagated
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Use https://www.whatsmydns.net to check DNS

### **"Backend is slow on first request"**
- Free Render tier sleeps after 15 min
- First request after sleep takes ~20s (normal)
- Upgrade to $7/mo paid tier to keep it always-on

---

## **Next Steps (if you have budget)**

| Need | Free Option | Paid Option | Cost |
|------|-------------|-----------|------|
| Backend always-on | Wait 20s on 1st request | Render paid | $7/mo |
| Branded domain | .tk/.ml (Freenom) | .com domain | ~$10/yr |
| Email alerts | Email only | SendGrid/Resend | $0–20/mo |
| Database | None | Vercel Postgres / Supabase | Free–$10/mo |
| Payment gateway | Mock (Stripe free tier) | Stripe live | $0.29 + 2.2% per transaction |

---

## **Deploy Command Checklist**

```bash
# 1. Verify code
git status

# 2. Final commit
git add -A
git commit -m "ready for production"
git push origin main

# 3. Vercel auto-deploys on push ✓
# 4. Render auto-deploys on push ✓

# 5. Test
curl https://eshant3d.tk/estimator
curl https://api.eshant3d.tk/health
```

---

## **Support**

- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs
- **Freenom:** https://www.freenom.com/en/index.html
- **Google Search Console:** https://support.google.com/webmasters

---

**Done!** Your platform is live, indexed, secure, and cost-free. 🎉
