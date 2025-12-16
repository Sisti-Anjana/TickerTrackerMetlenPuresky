# Vercel Deployment Guide

This guide will help you deploy both the frontend and backend to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub repository with your code
3. Supabase project with environment variables ready

## Project Structure

```
.
├── api/
│   └── index.js          # Vercel serverless function (Express app)
├── client/               # React frontend
│   ├── src/
│   └── package.json
├── server/               # Express backend routes
├── config/               # Supabase configuration
├── vercel.json           # Vercel configuration
└── package.json          # Root dependencies
```

## Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## Step 2: Environment Variables Setup

You need to set the following environment variables in Vercel:

### Required Environment Variables

1. **SUPABASE_URL** - Your Supabase project URL
2. **SUPABASE_ANON_KEY** - Your Supabase anonymous key
3. **SUPABASE_SERVICE_ROLE** - Your Supabase service role key (for admin operations)
4. **JWT_SECRET** - Secret key for JWT token signing (use a strong random string)

### Optional Environment Variables

- **NODE_ENV** - Set to `production` (Vercel sets this automatically)
- **PORT** - Not needed for Vercel (handled automatically)

## Step 3: Deploy via Vercel Dashboard

### Option A: Import from GitHub

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other (or leave blank)
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`

5. Add all environment variables (see Step 2)
6. Click **"Deploy"**

### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy (first time - will ask questions)
vercel

# Deploy to production
vercel --prod
```

## Step 4: Verify Deployment

After deployment, Vercel will provide you with:
- **Frontend URL**: `https://your-project.vercel.app`
- **API URL**: `https://your-project.vercel.app/api`

### Test Endpoints

1. **Health Check**: `https://your-project.vercel.app/api/health`
2. **Test Endpoint**: `https://your-project.vercel.app/api/test`
3. **Frontend**: `https://your-project.vercel.app`

## Step 5: Update Frontend API Configuration

The frontend is already configured to use relative paths (`/api`) in production, which will work with Vercel's routing. No changes needed!

However, if you need to override the API URL, you can set:
- **REACT_APP_API_BASE_URL** environment variable in Vercel

## How It Works

1. **Frontend**: Vercel serves the React build from `client/build`
2. **Backend**: All `/api/*` requests are routed to `api/index.js` (serverless function)
3. **Express App**: The Express app in `api/index.js` handles all API routes
4. **Routing**: Vercel's `vercel.json` handles routing between frontend and API

## Troubleshooting

### API Routes Return 404

- Check that `vercel.json` has the correct rewrite rules
- Verify `api/index.js` exists and exports the Express app correctly
- Check Vercel function logs in the dashboard

### Environment Variables Not Working

- Ensure all variables are set in Vercel dashboard (Settings → Environment Variables)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Build Fails

- Check build logs in Vercel dashboard
- Ensure `client/package.json` has correct build script
- Verify all dependencies are listed in `package.json` files

### Database Connection Issues

- Verify Supabase environment variables are correct
- Check Supabase project is active and accessible
- Review Supabase logs for connection errors

## File Structure for Vercel

```
your-project/
├── api/
│   └── index.js              # Serverless function entry point
├── client/
│   ├── build/                # Built React app (generated)
│   ├── src/
│   └── package.json
├── server/
│   └── routes/               # Express routes
├── config/
│   └── supabase.js           # Supabase config
├── vercel.json               # Vercel configuration
└── package.json              # Root dependencies
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE` | Supabase service role key | `eyJhbGc...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-here` |
| `NODE_ENV` | Environment | `production` |

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Test API endpoints
4. ✅ Test frontend
5. ✅ Update any hardcoded URLs if needed

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Vercel function logs
3. Verify environment variables
4. Test API endpoints directly

## Notes

- Vercel automatically handles HTTPS
- Serverless functions have a 10-second timeout by default (can be increased)
- Cold starts may occur on first request after inactivity
- Vercel provides automatic scaling

