# Heroku Deployment Configuration

## Prerequisites
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Create a Heroku account: https://heroku.com

## Deployment Steps

1. **Login to Heroku**:
   ```bash
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_ANON_KEY=your_supabase_anon_key
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   heroku config:set JWT_SECRET=your_jwt_secret
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy unified app"
   git push heroku main
   ```

5. **Open your app**:
   ```bash
   heroku open
   ```

## What Heroku Will Do

1. Install all dependencies (root + client)
2. Build the React frontend
3. Start the Express server using the Procfile
4. Serve both frontend and backend from single URL
5. Provide you with a single URL like: `https://your-app-name.herokuapp.com`

## Benefits

✅ Single URL for everything  
✅ Automatic HTTPS  
✅ No CORS issues  
✅ Easy environment management  
✅ Automatic deployments from Git  
✅ Built-in monitoring  
✅ Free tier available  
