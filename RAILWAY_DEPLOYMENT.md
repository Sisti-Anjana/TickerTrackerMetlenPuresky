# Railway Deployment Configuration

## Environment Variables Required
Set these in your Railway project dashboard:

```
NODE_ENV=production
PORT=5001
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=https://your-app-name.up.railway.app
```

## Deployment Steps

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway project**:
   ```bash
   railway init
   ```

4. **Set environment variables**:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set SUPABASE_URL=your_supabase_url
   railway variables set SUPABASE_ANON_KEY=your_supabase_anon_key
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   railway variables set JWT_SECRET=your_jwt_secret
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

## What Railway Will Do

1. Install all dependencies (root + client)
2. Build the React frontend
3. Start the Express server in production mode
4. Serve both frontend and backend from single URL
5. Provide you with a single URL like: `https://your-app-name.up.railway.app`

## Benefits

✅ Single URL for everything  
✅ Automatic HTTPS  
✅ No CORS issues  
✅ Easy environment management  
✅ Automatic deployments from Git  
✅ Built-in monitoring  
