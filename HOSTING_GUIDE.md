# THAAT - Hosting & Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   MongoDB       │
│   (Vercel)      │     │   (Render)       │     │   (Atlas)       │
│   Static HTML   │     │   .NET 8 Web API │     │   Free 512MB    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

All three services have **free tiers** — no credit card required for initial setup.

---

## 1. MongoDB Atlas (Database)

### Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Sign Up
2. Create a **Free Shared Cluster** (M0 - 512MB)
3. Choose region: **Mumbai (ap-south-1)** for India-based users
4. Set cluster name: `thaat-cluster`

### Configuration

1. **Database Access** → Add user:
   - Username: `thaat-admin`
   - Password: Generate secure password (save it!)
   - Role: `readWriteAnyDatabase`

2. **Network Access** → Add IP:
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allow all — Render IPs change)

3. **Get Connection String**:
   - Click "Connect" → "Drivers" → Copy connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://thaat-admin:YOUR_PASSWORD@thaat-cluster.xxxxx.mongodb.net/ThaatDb?retryWrites=true&w=majority`

---

## 2. Backend API (Render)

### Option A: Render (Recommended - Free)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repo (or use public repo URL)

#### Settings:
| Field | Value |
|-------|-------|
| Name | `thaat-api` |
| Region | Singapore (closest to India) |
| Branch | `main` |
| Root Directory | `Practice2/Thaat20/backend` |
| Runtime | Docker |
| Dockerfile Path | `./Dockerfile` |
| Instance Type | Free |

#### Environment Variables:
```
MongoDB__ConnectionString = mongodb+srv://thaat-admin:PASSWORD@thaat-cluster.xxxxx.mongodb.net/ThaatDb?retryWrites=true&w=majority
MongoDB__DatabaseName = ThaatDb
Jwt__Secret = your-super-secret-jwt-key-minimum-32-characters-long!
Jwt__Issuer = thaat-api
Jwt__Audience = thaat-admin
Jwt__ExpirationHours = 24
Cors__AllowedOrigins__0 = https://your-thaat-frontend.vercel.app
DefaultAdmin__Username = admin
DefaultAdmin__Password = YourSecurePassword123!
```

5. Click **Create Web Service** → Wait for build (~3-5 mins)
6. Note your URL: `https://thaat-api-xxxx.onrender.com`

> ⚠️ **Free tier limitation**: Service sleeps after 15 mins of inactivity. First request after sleep takes ~30s (cold start).

### Option B: Railway (Alternative)

1. Go to [railway.app](https://railway.app) → Sign up
2. **New Project** → **Deploy from GitHub repo**
3. Set root directory to `Practice2/Thaat20/backend`
4. Add same environment variables as above
5. Railway auto-detects Dockerfile

---

## 3. Frontend (Vercel)

### Setup

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New** → **Project**
3. Import your GitHub repository

#### Settings:
| Field | Value |
|-------|-------|
| Framework Preset | Other |
| Root Directory | `Practice2/Thaat20/frontend` |
| Build Command | (leave empty) |
| Output Directory | `.` |
| Install Command | (leave empty) |

4. Click **Deploy**
5. Note your URL: `https://thaat-xxxx.vercel.app`

### Update API URL in Frontend

After deploying the backend, update the API base URL in `frontend/js/main.js` (or wherever `API_BASE` is defined):

```javascript
const API_BASE = 'https://thaat-api-xxxx.onrender.com/api';
```

Then redeploy frontend (push to GitHub triggers auto-deploy).

### Custom Domain (Optional)

1. In Vercel → Project Settings → Domains
2. Add your domain (e.g., `thaat.store`)
3. Update DNS records as instructed
4. Update CORS in backend env vars to include custom domain

---

## 4. Post-Deployment Checklist

- [ ] Backend health check: `GET https://your-api.onrender.com/health`
- [ ] Swagger docs: `GET https://your-api.onrender.com/swagger`
- [ ] Frontend loads products from API
- [ ] Admin login works at `/admin.html`
- [ ] Add products via admin panel
- [ ] Test cart → WhatsApp flow
- [ ] Update `Cors__AllowedOrigins__0` with actual Vercel URL
- [ ] Change default admin password via API or re-seed

---

## 5. Environment Variables Reference

### Backend (appsettings.json structure → env var mapping)

| Config Path | Env Variable | Description |
|-------------|-------------|-------------|
| `MongoDB:ConnectionString` | `MongoDB__ConnectionString` | Atlas connection string |
| `MongoDB:DatabaseName` | `MongoDB__DatabaseName` | Database name (ThaatDb) |
| `Jwt:Secret` | `Jwt__Secret` | JWT signing key (32+ chars) |
| `Jwt:Issuer` | `Jwt__Issuer` | Token issuer |
| `Jwt:Audience` | `Jwt__Audience` | Token audience |
| `Jwt:ExpirationHours` | `Jwt__ExpirationHours` | Token expiry (hours) |
| `Cors:AllowedOrigins:0` | `Cors__AllowedOrigins__0` | Frontend URL |
| `DefaultAdmin:Username` | `DefaultAdmin__Username` | First admin username |
| `DefaultAdmin:Password` | `DefaultAdmin__Password` | First admin password |

> **Note**: .NET uses `__` (double underscore) as separator for nested config in environment variables.

---

## 6. Scaling & Future Upgrades

| Need | Solution | Cost |
|------|----------|------|
| No cold starts | Render Starter ($7/mo) | Paid |
| More DB storage | Atlas M2 (2GB) | $9/mo |
| CDN + edge caching | Vercel Pro | $20/mo |
| Custom email | Zoho Mail Free | Free |
| Payment gateway | Razorpay (add later) | Per-transaction |

---

## 7. Local Development

```bash
# Backend
cd backend/Thaat.Api
dotnet run

# Frontend (separate terminal)
cd frontend
npx serve . -p 3000
# Or use VS Code Live Server extension
```

Backend runs on `http://localhost:5000` (or port in launchSettings).
Frontend calls API at `http://localhost:5000/api`.
Swagger UI at `http://localhost:5000/swagger`.
