# UNIFIED DEPLOYMENT GUIDE

## Overview
This guide will help you deploy your ticket management system as a single application with one URL serving both frontend and backend.

## Quick Start

### Option 1: Using Batch Script (Windows)
```bash
deploy-unified.bat
```

### Option 2: Using PowerShell Script (Windows)
```powershell
.\deploy-unified.ps1
```

### Option 3: Using npm Script
```bash
npm run deploy-unified
```

## Manual Steps

### 1. Build Frontend
```bash
cd client
npm run build
cd ..
```

### 2. Set Environment Variables
Copy `env-template.txt` to `.env` and update with your values:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET
- Other configuration values

### 3. Start Unified Server
```bash
NODE_ENV=production node server/index.js
```

## What This Does

1. **Builds the React frontend** into static files
2. **Serves the static files** from the Express server
3. **Handles API routes** through the same server
4. **Provides a single URL** for everything

## Access Points

- **Main Application**: http://localhost:5001
- **API Endpoints**: http://localhost:5001/api/*
- **Health Check**: http://localhost:5001/api/health
- **Test Endpoint**: http://localhost:5001/api/test

## Benefits

✅ Single URL for everything  
✅ No CORS issues  
✅ Easier deployment  
✅ Better performance  
✅ Simplified configuration  

## Troubleshooting

### If build fails:
- Check that all dependencies are installed: `npm run install-all`
- Verify client dependencies: `cd client && npm install`

### If server won't start:
- Check that PORT 5001 is available
- Verify .env file exists with correct values
- Check database connection

### If frontend doesn't load:
- Verify client/build directory exists
- Check that NODE_ENV=production is set
- Look at server logs for errors

## Production Deployment

For production deployment to services like Heroku, Railway, or DigitalOcean:

1. Set NODE_ENV=production
2. Set PORT to the service's assigned port
3. Update CLIENT_URL to your production domain
4. Deploy the entire project (not just client/build)

## Environment Variables Required

- SUPABASE_URL
- SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET
- PORT (optional, defaults to 5001)
- NODE_ENV=production
