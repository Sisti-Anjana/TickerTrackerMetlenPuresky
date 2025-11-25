# 📋 STEP-BY-STEP NETLIFY DASHBOARD SETUP

## Quick Setup Instructions

### 1. Open Netlify Dashboard
- Go to: https://app.netlify.com/
- Login to your account
- Find your site: **frabjous-fairy-9be454**

### 2. Access Site Settings
- Click on your site name
- Go to **Site settings** (in the left sidebar)
- Click **Redirects and rewrites**

### 3. Add Redirect Rule
Click **Add redirect** and enter:

```
From: /api/*
To: https://5360dbaf0288.ngrok-free.app/api/:splat
Status: 200
Force: ✅ (check this box)
```

### 4. Save Configuration
- Click **Save**
- Netlify will automatically redeploy
- Wait for deployment to complete

### 5. Test Your Setup
- Visit: https://frabjous-fairy-9be454.netlify.app
- Try logging in or creating a ticket
- Check browser developer tools (F12) → Network tab
- Verify API calls go to your ngrok URL

## Alternative: Upload Configuration File

### Option 1: Download netlify.toml
1. Download the `netlify.toml` file from your project
2. Upload it to your Netlify site's root directory
3. Redeploy your site

### Option 2: Create netlify.toml in Netlify
1. Go to **Deploys** → **Deploy settings**
2. Click **Edit settings**
3. Add this to **Build settings**:

```toml
[build]
  publish = "client/build"
  command = "cd client && npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://5360dbaf0288.ngrok-free.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## When ngrok URL Changes

### Method 1: Update Redirect Rules
1. Go to Site settings → Redirects and rewrites
2. Edit the existing redirect rule
3. Update the ngrok URL
4. Save changes

### Method 2: Use Update Script
```bash
setup-netlify-redirects.bat https://YOUR_NEW_NGROK_URL
```

## Verification Checklist

- [ ] Redirect rule added in Netlify dashboard
- [ ] Status set to 200
- [ ] Force option checked
- [ ] Site redeployed successfully
- [ ] Frontend loads at: https://frabjous-fairy-9be454.netlify.app
- [ ] API calls redirect to ngrok backend
- [ ] Login/registration works
- [ ] No CORS errors in browser console

## Your Single Shareable URL
**https://frabjous-fairy-9be454.netlify.app**

This URL will now:
- Load your React frontend
- Automatically redirect API calls to your ngrok backend
- Provide seamless user experience
- Work for all users without them needing to know about ngrok

