# Vercel Environment Variables - Quick Reference

## Required Environment Variables

Set these in **Vercel Dashboard → Your Project → Settings → Environment Variables**

### 1. Supabase Configuration

```
SUPABASE_URL=https://your-project-id.supabase.co
```

**Where to find:**
- Go to Supabase Dashboard → Your Project → Settings → API
- Copy the "Project URL"

---

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
- Go to Supabase Dashboard → Your Project → Settings → API
- Copy the "anon public" key (starts with `eyJ...`)

---

```
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
- Go to Supabase Dashboard → Your Project → Settings → API
- Copy the "service_role" key (starts with `eyJ...`)
- ⚠️ Keep this secret - never expose it in frontend code

---

### 2. JWT Secret

```
JWT_SECRET=your-strong-random-secret-key-minimum-32-characters-long
```

**How to generate:**
- Use Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Or use an online generator: https://randomkeygen.com/
- Must be at least 32 characters long
- Use a strong random string

---

### 3. Frontend API URL (Optional)

```
REACT_APP_API_BASE_URL=/api
```

**Value:**
- For combined deployment: `/api` (relative path)
- This tells the frontend to use relative API paths

---

## How to Set in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project: **ticker-tracker-metlen-puresky**
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. For each variable:
   - **Key**: Variable name (e.g., `SUPABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select all three:
     - ☑ Production
     - ☑ Preview  
     - ☑ Development
6. Click **Save**
7. Repeat for all 5 variables
8. **Redeploy** your project after adding variables

---

## Complete List (Copy-Paste Format)

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-strong-random-secret-key-minimum-32-characters-long
REACT_APP_API_BASE_URL=/api
```

---

## Important Notes

- ✅ Environment variables are **case-sensitive**
- ✅ Changes require a **redeploy** to take effect
- ✅ Never commit these values to Git
- ✅ Use different secrets for production vs development (optional)
- ✅ The `SUPABASE_SERVICE_ROLE` key has admin privileges - keep it secret

---

## Verification

After setting variables and redeploying:

1. Check Vercel deployment logs for any errors
2. Test API endpoint: `https://your-project.vercel.app/api/health`
3. Test login functionality
4. Check function logs in Vercel dashboard if issues occur

---

## Troubleshooting

**Variables not working?**
- Verify variable names match exactly (case-sensitive)
- Ensure all environments are selected (Production, Preview, Development)
- Redeploy after adding/changing variables
- Check Vercel function logs for errors

**Can't find Supabase keys?**
- Make sure you're logged into Supabase
- Go to: Project Settings → API
- Keys are in the "Project API keys" section

