# Deploy THAAT to Vercel — GitHub Integration

## Quick Steps

### 1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up / Log in with your GitHub account (`aniket-oo4`)
   - Click **"New Project"**
   - Select **"Continue with GitHub"** (if not already connected, authorize Vercel)

### 2. **Import Repository**
   - Search for **"Thaat"** in the "Import Git Repository" section
   - Click on **`aniket-oo4/Thaat`**
   - Click **"Import"**

### 3. **Configure Project**
   - **Project Name**: `thaat` (or your preferred subdomain)
   - **Framework Preset**: Leave as **"Other"** (static site)
   - **Root Directory**: `.` (default) — Vercel will read `vercel.json`
   - **Build Command**: *(leave empty — no build needed for static)*
   - **Output Directory**: `frontend` (already configured in `vercel.json`)
   - **Environment Variables**: *(skip for now)*
   
   ![Vercel Config Screenshot]
   ```
   Root Directory: .
   Output Directory: frontend
   ```

### 4. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (~2–5 minutes)
   - ✅ Your site will be live at: `https://thaat.vercel.app` (or custom domain)

### 5. **Verify Deployment**
   - You should see your **THAAT** storefront
   - If 404: Check Vercel Deployments tab → click latest → view build logs
   - Ensure no errors in logs

---

## After Deployment

### Auto-Deploy on Push
- Every time you push to `master` on GitHub → Vercel auto-redeploys
- Your changes go live automatically ✨

### Custom Domain (Optional)
- Go to Vercel Project Settings → **"Domains"**
- Add custom domain (e.g., `thaat.in`, `thaat.shop`)
- Update DNS records (CNAME/A records provided by Vercel)

### Environment Variables (If Backend Needed Later)
- Project Settings → **"Environment Variables"**
- Add: `NEXT_PUBLIC_API_URL=https://thaat-api.onrender.com/api`
- Redeploy to apply

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **404 Not Found** | `vercel.json` not in root? Check file exists at project root, not in `frontend/` |
| **Files not loading** | Clear browser cache (Ctrl+Shift+Del) or use incognito mode |
| **Stale deployment** | Click **"Redeploy"** in Vercel dashboard or force push: `git push -f origin master` |
| **CSS/JS missing** | Check `frontend/css/` and `frontend/js/` folders exist in GitHub repo |

---

## Git Workflow for Future Updates

```bash
# Make changes locally
git add .
git commit -m "Feature: Add XYZ"
git push origin master

# ✨ Vercel automatically redeploys on push!
```

---

## Current Setup Summary

✅ **GitHub Repo**: https://github.com/aniket-oo4/Thaat  
✅ **Vercel Config**: Root `vercel.json` configured  
✅ **Public Directory**: `frontend/`  
✅ **Routing**: SPA rewrites to `index.html`  
✅ **Auto-deploy**: Enabled on push to `master`

**Ready to deploy! 🚀**
