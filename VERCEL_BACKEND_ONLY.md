# Vercel Backend Deployment Guide (Step 2)

This guide will help you deploy **only the backend** to Vercel as a separate project.

## Prerequisites

1. A Vercel account
2. GitHub repository with your code
3. Supabase project with credentials ready

## Step 1: Create Backend-Only Vercel Configuration

Create a `vercel.json` file in the root directory (or use a separate backend project):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

## Step 2: Create API Handler

Ensure `api/index.js` exists and exports your Express app (already created).

## Step 3: Set Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these **required** variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-strong-random-secret-key-here-minimum-32-characters
```

See `VERCEL_ENV_VARIABLES.md` for details on finding these values.

## Step 4: Deploy Backend as Separate Project

### Option A: Separate Repository/Folder

1. Create a new Vercel project
2. Point to your repository
3. Configure:
   - **Root Directory**: `.` (or create a `backend/` folder)
   - **Build Command**: Leave empty (no build needed for Node.js)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. Add environment variables (see Step 3)
5. Click **"Deploy"**

### Option B: Use Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy backend
vercel --prod
```

## Step 5: Get Backend URL

After deployment, Vercel will provide:
- **Backend URL**: `https://your-backend-project.vercel.app`

All API routes will be available at:
- `https://your-backend-project.vercel.app/api/auth/login`
- `https://your-backend-project.vercel.app/api/tickets`
- etc.

## Step 6: Update Frontend to Use Backend URL

1. Go to your **frontend Vercel project**
2. Settings → Environment Variables
3. Update or add:
   - **Key**: `REACT_APP_API_BASE_URL`
   - **Value**: `https://your-backend-project.vercel.app/api`
4. Redeploy frontend

## Step 7: Update CORS on Backend

Update `api/index.js` CORS configuration:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-project.vercel.app',
    'https://your-frontend-project-*.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
}));
```

Redeploy backend after updating CORS.

## Step 8: Verify Backend Deployment

### Test Endpoints

1. **Health Check**: `https://your-backend-project.vercel.app/api/health`
2. **Test Endpoint**: `https://your-backend-project.vercel.app/api/test`
3. **Auth Endpoint**: `https://your-backend-project.vercel.app/api/auth/test`

### Check Logs

- Go to Vercel Dashboard → Your Backend Project → Functions
- Click on a function to see logs
- Check for any errors

## Troubleshooting

### 404 Errors on API Routes

- Verify `api/index.js` exists and exports the Express app
- Check `vercel.json` routes configuration
- Ensure routes start with `/api/` in your Express app

### Database Connection Errors

- Verify Supabase environment variables are set correctly
- Check Supabase project is active
- Review function logs for detailed error messages

### CORS Errors

- Update CORS origin to include your frontend URL
- Ensure `credentials: true` is set
- Redeploy backend after CORS changes

### Environment Variables Not Working

- Verify variables are set in Vercel dashboard
- Redeploy after adding/changing variables
- Check variable names match exactly (case-sensitive)

## Current Setup

- ✅ Frontend: Deployed to Vercel (separate project)
- ✅ Backend: Deployed to Vercel (separate project)
- ⏳ Combined: Not yet configured

## Project Structure

```
your-repo/
├── api/
│   └── index.js          # Backend serverless function
├── server/
│   └── routes/           # Express routes
├── config/
│   └── supabase.js       # Supabase config
└── vercel.json           # Backend configuration
```

## Next Steps

Once both frontend and backend are working separately:
1. Follow **VERCEL_COMBINED.md** to combine them into a single project
2. Or keep them separate (current setup works fine!)

## Benefits of Separate Projects

- ✅ Independent scaling
- ✅ Separate deployments
- ✅ Different environment variables
- ✅ Easier debugging
- ✅ Can use different Vercel plans

## Notes

- Backend functions have 10-second timeout by default
- Can be increased to 60 seconds in Vercel Pro plan
- Cold starts may occur after inactivity
- Vercel automatically handles HTTPS

