# Vercel Deployment Guide - Fresh Deployment

Deploy everything fresh to Vercel (frontend + backend combined).

## Step 1: Prepare Your Code

1. Make sure you've pushed all code to GitHub
2. Verify these files exist:
   - ✅ `vercel.json` - Configuration file
   - ✅ `api/index.js` - Backend serverless function
   - ✅ `client/` - Frontend React app
   - ✅ `server/` - Backend routes
   - ✅ `config/supabase.js` - Supabase configuration

## Step 2: Deploy to Vercel (Combined)

1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other (or leave blank)
   - **Root Directory**: `.` (root)
   - **Build Command**: `cd client && npm install && CI=false npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`
5. Add **Environment Variables** (Settings → Environment Variables):
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_ANON_KEY` = Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE` = Your Supabase service role key
   - `JWT_SECRET` = Random secret key (minimum 32 characters)
   - `REACT_APP_API_BASE_URL` = `/api` (relative path for combined deployment)
6. Click **"Deploy"**
7. Wait for deployment to complete

## Step 3: Get Your URL

After deployment, Vercel will provide:
- **Your App URL**: `https://your-project.vercel.app`
- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/*`

## Step 4: Test Your Deployment

1. **Test Frontend**: Visit `https://your-project.vercel.app`
2. **Test API Health**: Visit `https://your-project.vercel.app/api/health`
3. **Test API Test**: Visit `https://your-project.vercel.app/api/test`
4. **Test Login**: Try logging in through the frontend

## Environment Variables Reference

See `VERCEL_ENV_VARIABLES.md` for details on finding these values:

- `SUPABASE_URL` - From Supabase Dashboard → Settings → API
- `SUPABASE_ANON_KEY` - From Supabase Dashboard → Settings → API (anon public)
- `SUPABASE_SERVICE_ROLE` - From Supabase Dashboard → Settings → API (service_role)
- `JWT_SECRET` - Generate a random string (32+ characters)
- `REACT_APP_API_BASE_URL` - Set to `/api` for combined deployment

## How It Works

- **Frontend**: Served as static files from `client/build`
- **API Routes**: All `/api/*` requests → `api/index.js` (serverless function)
- **Single URL**: Everything works on one domain

## Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json` files

**API Returns 404:**
- Verify `api/index.js` exists
- Check `vercel.json` has correct rewrite rule
- Review function logs in Vercel dashboard

**Database Connection Errors:**
- Verify Supabase environment variables are correct
- Check Supabase project is active
- Review function logs for detailed errors

**CORS Errors:**
- Update CORS in `api/index.js` to allow your Vercel domain
- Or use `origin: true` to allow all origins

## That's It!

Your app is now deployed on Vercel with frontend and backend combined. Everything works on a single URL.

