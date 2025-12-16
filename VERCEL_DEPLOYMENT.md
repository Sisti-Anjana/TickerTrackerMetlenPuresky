# Vercel Deployment Guide

Simple step-by-step guide to deploy frontend and backend to Vercel.

## Step 1: Deploy Frontend First

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Build Command**: `cd client && npm install && CI=false npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `cd client && npm install`
5. Add environment variable:
   - `REACT_APP_API_BASE_URL` = `https://tickertrackermetlenpuresky.onrender.com/api` (your current backend)
6. Click "Deploy"
7. Get your frontend URL: `https://your-project.vercel.app`

## Step 2: Deploy Backend

1. Go to Vercel dashboard
2. Click "Add New Project" (create a NEW project for backend)
3. Import the same GitHub repository
4. Configure:
   - **Root Directory**: `.`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
5. Add environment variables:
   - `SUPABASE_URL` = Your Supabase URL
   - `SUPABASE_ANON_KEY` = Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE` = Your Supabase service role key
   - `JWT_SECRET` = Random secret key (32+ characters)
6. Click "Deploy"
7. Get your backend URL: `https://your-backend-project.vercel.app/api`

8. Update frontend to use new backend:
   - Go to frontend project → Settings → Environment Variables
   - Update `REACT_APP_API_BASE_URL` to: `https://your-backend-project.vercel.app/api`
   - Redeploy frontend

## Step 3: Combine Frontend + Backend (Optional)

1. Create a NEW Vercel project (or update existing frontend)
2. Configure:
   - **Build Command**: `cd client && npm install && CI=false npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`
3. Add ALL environment variables (frontend + backend)
4. Ensure `vercel.json` exists with combined config (already created)
5. Deploy
6. Get combined URL: `https://your-combined-project.vercel.app`

## Environment Variables Needed

**For Backend:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `JWT_SECRET`

**For Frontend:**
- `REACT_APP_API_BASE_URL` (use `/api` for combined, or backend URL for separate)

## Files Already Created

- ✅ `vercel.json` - Combined configuration
- ✅ `api/index.js` - Backend serverless function
- ✅ `VERCEL_ENV_VARIABLES.md` - Environment variables reference

That's it! Follow the steps above.

