# Vercel Combined Deployment Guide (Step 3 - Final)

This guide will help you combine frontend and backend into a **single Vercel project**.

## Prerequisites

1. ✅ Frontend deployed to Vercel (or ready to deploy)
2. ✅ Backend deployed to Vercel (or ready to deploy)
3. ✅ Both working separately

## Step 1: Update Vercel Configuration

Use the combined `vercel.json` configuration:

```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && CI=false npm run build",
  "outputDirectory": "client/build",
  "installCommand": "npm install && cd client && npm install",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

This configuration:
- Builds the React frontend
- Serves frontend from `client/build`
- Routes all `/api/*` requests to the serverless function

## Step 2: Set All Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add **all** required variables:

### Backend Variables
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-strong-random-secret-key-here-minimum-32-characters
```

### Frontend Variables (Optional)
```
REACT_APP_API_BASE_URL=/api
```

Note: If you set `REACT_APP_API_BASE_URL` to `/api`, the frontend will use relative paths, which works perfectly with the combined setup.

## Step 3: Deploy Combined Project

### Option A: New Combined Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (root)
   - **Build Command**: `cd client && npm install && CI=false npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`

5. Add all environment variables (see Step 2)
6. Click **"Deploy"**

### Option B: Update Existing Project

If you already have a frontend project:

1. Go to your Vercel project
2. Settings → General
3. Update Build & Development Settings:
   - **Build Command**: `cd client && npm install && CI=false npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`
4. Add backend environment variables
5. Ensure `vercel.json` is updated (see Step 1)
6. Redeploy

## Step 4: Update Frontend API Configuration

The frontend should use relative paths for API calls. Check `client/src/services/api.ts`:

```typescript
// Should use '/api' in production (relative path)
const apiBaseURL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');
```

This is already configured correctly! No changes needed.

## Step 5: Update CORS Configuration

Update `api/index.js` CORS to allow your Vercel domain:

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

Or use `origin: true` to allow all origins (simpler):

```javascript
app.use(cors({
  origin: true,
  credentials: true,
}));
```

## Step 6: Verify Combined Deployment

After deployment, you'll get a single URL:
- **Combined URL**: `https://your-project.vercel.app`

### Test Everything

1. **Frontend**: `https://your-project.vercel.app`
2. **API Health**: `https://your-project.vercel.app/api/health`
3. **API Test**: `https://your-project.vercel.app/api/test`
4. **Login**: Try logging in through the frontend

### Expected Behavior

- ✅ Frontend loads correctly
- ✅ API calls work (no CORS errors)
- ✅ Login works
- ✅ All features function normally

## Step 7: Clean Up Separate Projects (Optional)

If you deployed frontend and backend separately first:

1. You can keep them as backups
2. Or delete them to avoid confusion
3. Update any external references to use the combined URL

## Project Structure

```
your-repo/
├── api/
│   └── index.js          # Backend serverless function
├── client/
│   ├── build/            # Built React app (generated)
│   ├── src/
│   └── package.json
├── server/
│   └── routes/           # Express routes
├── config/
│   └── supabase.js       # Supabase config
└── vercel.json           # Combined configuration
```

## How It Works

1. **Frontend**: Served as static files from `client/build`
2. **API Routes**: All `/api/*` requests → `api/index.js` (serverless function)
3. **SPA Routing**: All other routes → `index.html` (handled by React Router)
4. **Single Domain**: Everything on one URL

## Benefits of Combined Deployment

- ✅ Single URL for everything
- ✅ No CORS issues (same origin)
- ✅ Simpler configuration
- ✅ Easier to manage
- ✅ Single deployment

## Troubleshooting

### Frontend Shows but API Returns 404

- Check `vercel.json` has correct rewrite rule
- Verify `api/index.js` exists and exports Express app
- Check function logs in Vercel dashboard

### CORS Errors

- Update CORS in `api/index.js` to include your domain
- Use `origin: true` for development
- Redeploy after CORS changes

### Environment Variables Not Working

- Verify all variables are set in Vercel dashboard
- Check variable names match exactly
- Redeploy after adding variables

### Build Fails

- Check build logs in Vercel dashboard
- Ensure `client/package.json` has correct build script
- Verify all dependencies are installed

## Final Checklist

- [ ] `vercel.json` configured correctly
- [ ] `api/index.js` exists and exports Express app
- [ ] All environment variables set in Vercel
- [ ] Frontend API configuration uses `/api` (relative)
- [ ] CORS allows your Vercel domain
- [ ] Deployed successfully
- [ ] Frontend loads
- [ ] API endpoints work
- [ ] Login works
- [ ] All features tested

## Current Setup

- ✅ Frontend: Deployed to Vercel
- ✅ Backend: Deployed to Vercel
- ✅ Combined: Single project, single URL

## Single URL Result

After completing all steps, you'll have:
- **One URL**: `https://your-project.vercel.app`
- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/*`

Everything works together seamlessly! 🎉

## Next Steps

1. ✅ Test all features
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring (optional)
4. ✅ Set up CI/CD (automatic with GitHub)

## Notes

- Vercel automatically handles HTTPS
- Serverless functions scale automatically
- Cold starts may occur after inactivity
- Function timeout: 10 seconds (free), 60 seconds (Pro)
- Automatic deployments on Git push

