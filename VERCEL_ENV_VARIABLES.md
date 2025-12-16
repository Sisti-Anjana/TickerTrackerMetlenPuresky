# Vercel Environment Variables

Copy these environment variables to your Vercel project settings.

## Required Variables

Set these in Vercel Dashboard → Your Project → Settings → Environment Variables

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-strong-random-secret-key-here-minimum-32-characters
```

## Where to Find These Values

### Supabase Variables

1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE`

### JWT Secret

Generate a strong random string (minimum 32 characters):

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use an online generator
# https://randomkeygen.com/
```

## Setting Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `SUPABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select **Production**, **Preview**, and **Development** (or just **Production**)
5. Click **Save**
6. **Redeploy** your project for changes to take effect

## Verification

After setting variables, verify they're working:

1. Check Vercel deployment logs for any errors
2. Test the health endpoint: `https://your-project.vercel.app/api/health`
3. Check function logs in Vercel dashboard

## Notes

- Environment variables are case-sensitive
- Changes require a redeploy to take effect
- Never commit these values to Git
- Use different secrets for production vs development

