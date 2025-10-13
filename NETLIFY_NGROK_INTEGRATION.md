# 🌐 NETLIFY + NGROK INTEGRATION GUIDE

## Current Setup
- **Frontend**: https://frabjous-fairy-9be454.netlify.app (Netlify)
- **Backend**: https://5360dbaf0288.ngrok-free.app (ngrok)
- **Single URL**: https://frabjous-fairy-9be454.netlify.app (redirects API calls to ngrok)

## How It Works

1. **Users visit**: https://frabjous-fairy-9be454.netlify.app
2. **Frontend loads** from Netlify
3. **API calls** (like `/api/auth/login`) are automatically redirected to your ngrok backend
4. **Users see seamless experience** - they only need one URL!

## When ngrok URL Changes

### Quick Update (Windows Batch)
```bash
update-ngrok-url.bat https://YOUR_NEW_NGROK_URL
```

### Quick Update (PowerShell)
```powershell
.\update-ngrok-url.ps1 https://YOUR_NEW_NGROK_URL
```

### Manual Update
1. Open `netlify.toml`
2. Find line: `to = "https://5360dbaf0288.ngrok-free.app/api/:splat"`
3. Replace with your new ngrok URL
4. Commit and push changes

## Deployment Workflow

### 1. Start Backend (ngrok)
```bash
# In your project directory
node server/index.js
# In another terminal
ngrok http 5001
```

### 2. Update Netlify Config
```bash
# Copy the ngrok URL and update
update-ngrok-url.bat https://YOUR_NGROK_URL
```

### 3. Deploy Frontend
```bash
# Commit and push changes
git add .
git commit -m "Update ngrok URL"
git push origin main
```

### 4. Share Single URL
**Share this URL with others**: https://frabjous-fairy-9be454.netlify.app

## Benefits

✅ **Single URL** - Users only need to bookmark one URL  
✅ **No CORS issues** - Netlify handles the proxy  
✅ **Easy sharing** - Just share the Netlify URL  
✅ **Automatic updates** - When you update ngrok, just update config  
✅ **Professional** - Users don't see ngrok URLs  

## Troubleshooting

### If API calls fail:
1. Check if ngrok is running: `https://YOUR_NGROK_URL/api/test`
2. Verify netlify.toml has correct ngrok URL
3. Check Netlify deploy logs

### If ngrok URL changes:
1. Run: `update-ngrok-url.bat NEW_URL`
2. Commit and push changes
3. Wait for Netlify rebuild

### If Netlify doesn't rebuild:
1. Go to Netlify dashboard
2. Trigger manual deploy
3. Check build logs

## Environment Variables

Make sure your ngrok backend has these environment variables:
```
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

## Quick Commands

```bash
# Start backend
node server/index.js

# Start ngrok (in another terminal)
ngrok http 5001

# Update ngrok URL in Netlify config
update-ngrok-url.bat https://YOUR_NGROK_URL

# Deploy to Netlify
git add . && git commit -m "Update" && git push
```

## Your Shareable URL
**https://frabjous-fairy-9be454.netlify.app**

This is the only URL you need to share with others! 🎉