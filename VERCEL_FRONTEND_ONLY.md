# Vercel Frontend Deployment Guide (Step 1)

This guide will help you deploy **only the frontend** to Vercel first.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub repository with your code
3. Your backend API URL (from Render or another service) for API calls

## Step 1: Create Frontend-Only Vercel Configuration

Create a `vercel.json` file in the root directory:

```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && CI=false npm run build",
  "outputDirectory": "client/build",
  "installCommand": "cd client && npm install"
}
```

## Step 2: Update Frontend API Configuration

The frontend needs to know where your backend API is located. You have two options:

### Option A: Use Environment Variable (Recommended)

Set `REACT_APP_API_BASE_URL` in Vercel to point to your backend:

- If backend is on Render: `https://tickertrackermetlenpuresky.onrender.com/api`
- If backend is on another service: `https://your-backend-url.com/api`

### Option B: Use Relative Paths (If backend will be on same domain later)

The frontend is already configured to use `/api` in production, which will work once backend is deployed.

## Step 3: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App (or Other)
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `cd client && npm install && CI=false npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `cd client && npm install`

5. **Environment Variables** (if using Option A):
   - **Key**: `REACT_APP_API_BASE_URL`
   - **Value**: Your backend API URL (e.g., `https://tickertrackermetlenpuresky.onrender.com/api`)
   - **Environment**: Production, Preview, Development

6. Click **"Deploy"**

## Step 4: Verify Frontend Deployment

After deployment, Vercel will provide:
- **Frontend URL**: `https://your-project.vercel.app`

### Test the Frontend

1. Visit your Vercel URL
2. Check browser console for any errors
3. Try logging in (it will call your backend API)

## Step 5: Update CORS on Backend

Make sure your backend (Render) allows requests from your Vercel frontend:

1. Go to your backend code (`server/index.js`)
2. Update CORS to include your Vercel domain:
   ```javascript
   app.use(cors({
     origin: [
       'https://your-project.vercel.app',
       'https://your-project-*.vercel.app', // Preview deployments
       'http://localhost:3000' // Local development
     ],
     credentials: true,
   }));
   ```
3. Redeploy your backend

## Troubleshooting

### Frontend Can't Connect to Backend

- Check `REACT_APP_API_BASE_URL` is set correctly in Vercel
- Verify backend CORS allows your Vercel domain
- Check browser console for CORS errors
- Test backend API directly: `https://your-backend-url.com/api/health`

### Build Fails

- Check build logs in Vercel dashboard
- Ensure `client/package.json` exists and has correct build script
- Verify all dependencies are listed

### Environment Variables Not Working

- Ensure variable name starts with `REACT_APP_`
- Redeploy after adding environment variables
- Check variable names are case-sensitive

## Current Setup

- ✅ Frontend: Deployed to Vercel
- ⏳ Backend: Still on Render (or other service)
- ⏳ Combined: Not yet configured

## Next Steps

Once frontend is working:
1. Proceed to **VERCEL_BACKEND_ONLY.md** to deploy backend
2. Then follow **VERCEL_COMBINED.md** to combine them

## Files Needed

- `vercel.json` (frontend-only configuration)
- `client/` directory with React app
- Backend API URL for environment variable

