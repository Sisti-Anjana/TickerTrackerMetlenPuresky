# Vercel Deployment - Step by Step Guide

Follow these steps in order to deploy your application to Vercel.

## 📋 Overview

1. **Step 1**: Deploy Frontend Only
2. **Step 2**: Deploy Backend Only  
3. **Step 3**: Combine Frontend + Backend

---

## 🎨 Step 1: Deploy Frontend Only

### Quick Start

1. **Rename configuration file**:
   ```bash
   # Copy frontend-only config
   cp vercel.frontend.json vercel.json
   ```

2. **Push to GitHub**:
   ```bash
   git add vercel.json
   git commit -m "Configure Vercel for frontend-only deployment"
   git push origin main
   ```

3. **Deploy to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Build Command**: `cd client && npm install && CI=false npm run build`
     - **Output Directory**: `client/build`
     - **Install Command**: `cd client && npm install`
   - **Environment Variables**:
     - `REACT_APP_API_BASE_URL` = `https://tickertrackermetlenpuresky.onrender.com/api` (your current backend URL)
   - Click "Deploy"

4. **Get Frontend URL**: `https://your-frontend-project.vercel.app`

### Detailed Guide
See **VERCEL_FRONTEND_ONLY.md** for complete instructions.

---

## ⚙️ Step 2: Deploy Backend Only

### Quick Start

1. **Rename configuration file**:
   ```bash
   # Copy backend-only config
   cp vercel.backend.json vercel.json
   ```

2. **Push to GitHub**:
   ```bash
   git add vercel.json
   git commit -m "Configure Vercel for backend-only deployment"
   git push origin main
   ```

3. **Deploy to Vercel** (as separate project):
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `.`
     - **Build Command**: Leave empty
     - **Output Directory**: Leave empty
     - **Install Command**: `npm install`
   - **Environment Variables** (see VERCEL_ENV_VARIABLES.md):
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE`
     - `JWT_SECRET`
   - Click "Deploy"

4. **Get Backend URL**: `https://your-backend-project.vercel.app/api`

5. **Update Frontend**:
   - Go to frontend Vercel project
   - Settings → Environment Variables
   - Update `REACT_APP_API_BASE_URL` to: `https://your-backend-project.vercel.app/api`
   - Redeploy frontend

### Detailed Guide
See **VERCEL_BACKEND_ONLY.md** for complete instructions.

---

## 🚀 Step 3: Combine Frontend + Backend

### Quick Start

1. **Use combined configuration**:
   ```bash
   # The current vercel.json is already configured for combined deployment
   # Or copy it:
   # Current vercel.json already has the combined config
   ```

2. **Create new combined project** (or update existing):
   - Go to https://vercel.com/dashboard
   - Click "Add New Project" (or update existing)
   - Import your GitHub repository
   - Configure:
     - **Build Command**: `cd client && npm install && CI=false npm run build`
     - **Output Directory**: `client/build`
     - **Install Command**: `npm install && cd client && npm install`
   - **Environment Variables** (all of them):
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE`
     - `JWT_SECRET`
     - `REACT_APP_API_BASE_URL` = `/api` (relative path)
   - Click "Deploy"

3. **Get Combined URL**: `https://your-combined-project.vercel.app`

4. **Test Everything**:
   - Frontend: `https://your-combined-project.vercel.app`
   - API: `https://your-combined-project.vercel.app/api/health`

### Detailed Guide
See **VERCEL_COMBINED.md** for complete instructions.

---

## 📁 Configuration Files

- `vercel.json` - Current (combined configuration)
- `vercel.frontend.json` - Frontend-only configuration
- `vercel.backend.json` - Backend-only configuration

## 🔄 Switching Between Configurations

To switch configurations, simply rename the files:

```bash
# For frontend-only
cp vercel.frontend.json vercel.json

# For backend-only
cp vercel.backend.json vercel.json

# For combined (current)
# vercel.json already has combined config
```

## ✅ Checklist

### Step 1: Frontend Only
- [ ] Renamed `vercel.frontend.json` to `vercel.json`
- [ ] Pushed to GitHub
- [ ] Created Vercel project
- [ ] Set `REACT_APP_API_BASE_URL` environment variable
- [ ] Deployed successfully
- [ ] Frontend loads correctly
- [ ] Can connect to backend API

### Step 2: Backend Only
- [ ] Renamed `vercel.backend.json` to `vercel.json`
- [ ] Pushed to GitHub
- [ ] Created separate Vercel project for backend
- [ ] Set all Supabase environment variables
- [ ] Set JWT_SECRET
- [ ] Deployed successfully
- [ ] Backend API works (`/api/health` returns success)
- [ ] Updated frontend to use new backend URL
- [ ] Frontend can connect to new backend

### Step 3: Combined
- [ ] Using combined `vercel.json` configuration
- [ ] Created/updated Vercel project
- [ ] Set all environment variables (frontend + backend)
- [ ] Deployed successfully
- [ ] Frontend loads
- [ ] API endpoints work
- [ ] Login works
- [ ] All features tested

## 🆘 Troubleshooting

### Frontend Issues
- See **VERCEL_FRONTEND_ONLY.md** troubleshooting section

### Backend Issues
- See **VERCEL_BACKEND_ONLY.md** troubleshooting section

### Combined Issues
- See **VERCEL_COMBINED.md** troubleshooting section

## 📚 Additional Resources

- **VERCEL_FRONTEND_ONLY.md** - Detailed frontend deployment guide
- **VERCEL_BACKEND_ONLY.md** - Detailed backend deployment guide
- **VERCEL_COMBINED.md** - Detailed combined deployment guide
- **VERCEL_ENV_VARIABLES.md** - Environment variables reference

## 🎯 Final Result

After completing all steps, you'll have:

**Option A: Separate Projects**
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app/api`

**Option B: Combined Project** (Recommended)
- Single URL: `https://your-project.vercel.app`
- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/*`

## 💡 Recommendation

**Start with Step 1 (Frontend Only)** to get familiar with Vercel, then proceed to Step 2 and Step 3. This incremental approach helps identify and fix issues at each stage.

