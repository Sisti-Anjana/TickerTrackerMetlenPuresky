# 🔧 MANUAL NETLIFY CONFIGURATION GUIDE

## Since you deployed manually (not through Git), follow these steps:

### Step 1: Access Netlify Dashboard
1. Go to: https://app.netlify.com/
2. Find your site: **frabjous-fairy-9be454**
3. Click on your site name

### Step 2: Configure Redirects
1. Go to **Site settings** → **Redirects and rewrites**
2. Click **Add redirect**
3. Configure the redirect:

**From**: `/api/*`
**To**: `https://5360dbaf0288.ngrok-free.app/api/:splat`
**Status**: `200`
**Force**: ✅ (check this box)

### Step 3: Add Additional Redirects (if needed)
If you need more specific redirects, add these:

**Auth Login**:
- From: `/api/auth/login`
- To: `https://5360dbaf0288.ngrok-free.app/api/auth/login`
- Status: `200`

**Auth Register**:
- From: `/api/auth/register`
- To: `https://5360dbaf0288.ngrok-free.app/api/auth/register`
- Status: `200`

**All API Routes** (catch-all):
- From: `/api/*`
- To: `https://5360dbaf0288.ngrok-free.app/api/:splat`
- Status: `200`

### Step 4: Save and Deploy
1. Click **Save**
2. Netlify will automatically redeploy your site
3. Wait for deployment to complete

### Step 5: Test Your Configuration
1. Visit: https://frabjous-fairy-9be454.netlify.app
2. Open browser developer tools (F12)
3. Go to Network tab
4. Try to login or make an API call
5. Check if requests go to your ngrok URL

## Alternative: Upload netlify.toml File

If you prefer, you can also:
1. Download the updated `netlify.toml` file I created
2. Upload it to your Netlify site's root directory
3. Redeploy your site

## When ngrok URL Changes

### Method 1: Update in Netlify Dashboard
1. Go to Site settings → Redirects and rewrites
2. Edit the redirect rules
3. Update the ngrok URL
4. Save changes

### Method 2: Update netlify.toml and Re-upload
1. Run: `update-ngrok-url.bat https://YOUR_NEW_NGROK_URL`
2. Upload the updated `netlify.toml` to Netlify
3. Redeploy

## Your Single URL
**https://frabjous-fairy-9be454.netlify.app**

This will now redirect all API calls to your ngrok backend automatically!

## Troubleshooting

### If redirects don't work:
1. Check Netlify deploy logs
2. Verify redirect rules are saved
3. Test with browser developer tools
4. Make sure ngrok is running

### If you see CORS errors:
1. Check that redirects are configured correctly
2. Verify ngrok URL is accessible
3. Check browser console for errors

