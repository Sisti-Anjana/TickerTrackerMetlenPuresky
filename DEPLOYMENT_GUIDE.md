# Google Cloud Platform Deployment Guide
# Complete Guide for Deploying Your Ticket Tracking System

## 📋 Prerequisites

1. **Google Cloud Account**
   - Create account at: https://console.cloud.google.com
   - Enable billing (you get $300 free credits for 90 days)

2. **Install Google Cloud CLI**
   - Windows: Download from https://cloud.google.com/sdk/docs/install
   - Run: `gcloud --version` to verify installation

3. **Docker Desktop** (optional but recommended for local testing)
   - Download from: https://www.docker.com/products/docker-desktop

---

## 🚀 Deployment Steps

### Step 1: Initialize Google Cloud Project

```powershell
# Login to Google Cloud
gcloud auth login

# Create a new project (choose a unique project ID)
gcloud projects create your-ticket-system --name="Ticket Tracking System"

# Set the project as active
gcloud config set project your-ticket-system

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Set default region
gcloud config set run/region us-central1
```

---

### Step 2: Deploy Backend to Cloud Run

```powershell
# Navigate to your project directory
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"

# Build and deploy backend
gcloud run deploy ticket-system-backend `
  --source . `
  --dockerfile Dockerfile.backend `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "SUPABASE_URL=https://tlnojwnrvvrnujnhdlrr.supabase.co" `
  --set-env-vars "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjMwODgsImV4cCI6MjA3NTA5OTA4OH0.RO8AHtbWFPcqbUCpKylS5mXA24pSIWpQ5kXIs2Gs_BM" `
  --set-env-vars "JWT_SECRET=TanjTicketSystem2024SecureKey987654321" `
  --set-env-vars "PORT=8080" `
  --max-instances 10 `
  --memory 512Mi `
  --cpu 1

# After deployment, you'll get a URL like:
# https://ticket-system-backend-xxxxx-uc.a.run.app
# Save this URL - you'll need it for the frontend!
```

---

### Step 3: Update Frontend Configuration

Before deploying the frontend, you need to update the API endpoint:

1. Open: `client/src/config.ts` (or wherever your API URL is configured)
2. Replace the API URL with your backend Cloud Run URL
3. Example:
```typescript
   // config.ts
   export const API_URL = 'https://ticket-system-backend-xxxxx-uc.a.run.app';
```

---

### Step 4: Deploy Frontend to Cloud Run

```powershell
# Build and deploy frontend
gcloud run deploy ticket-system-frontend `
  --source . `
  --dockerfile Dockerfile.frontend `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --max-instances 10 `
  --memory 256Mi `
  --cpu 1

# You'll get a frontend URL like:
# https://ticket-system-frontend-xxxxx-uc.a.run.app
```

---

## 🔧 Alternative: One-Click Deployment Script

I've created automated deployment scripts for you:

### Windows PowerShell Script

```powershell
# File: deploy-to-gcp.ps1
# Run this script to deploy everything automatically

# Set your project ID
$PROJECT_ID = "your-ticket-system"

# Deploy backend
gcloud run deploy ticket-system-backend `
  --source . `
  --dockerfile Dockerfile.backend `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --project $PROJECT_ID

# Deploy frontend
gcloud run deploy ticket-system-frontend `
  --source . `
  --dockerfile Dockerfile.frontend `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --project $PROJECT_ID
```

---

## 💰 Cost Estimation

**Cloud Run Pricing** (as of 2024):
- First 2 million requests/month: FREE
- Additional requests: $0.40 per million
- Memory: $0.0000025 per GB-second
- CPU: $0.00002 per vCPU-second

**Estimated Monthly Cost for Low-Medium Traffic:**
- Backend: $5-15/month
- Frontend: $2-8/month
- **Total: $7-23/month**

**Free Tier Benefits:**
- You get 180,000 vCPU-seconds free per month
- 360,000 GB-seconds of memory free per month
- 2 million requests free per month

---

## 🔒 Security Best Practices

### 1. Environment Variables
Never commit sensitive data. Use Secret Manager:

```powershell
# Create secrets
echo "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo "your-supabase-key" | gcloud secrets create supabase-key --data-file=-

# Deploy with secrets
gcloud run deploy ticket-system-backend `
  --set-secrets="JWT_SECRET=jwt-secret:latest,SUPABASE_ANON_KEY=supabase-key:latest"
```

### 2. Enable CORS
Make sure your backend allows requests from your frontend domain.

### 3. Enable HTTPS
Cloud Run automatically provides SSL certificates!

---

## 📊 Monitoring and Logs

### View Logs
```powershell
# Backend logs
gcloud run logs read ticket-system-backend --limit 50

# Frontend logs
gcloud run logs read ticket-system-frontend --limit 50

# Stream live logs
gcloud run logs tail ticket-system-backend
```

### Cloud Console
Visit: https://console.cloud.google.com/run

---

## 🔄 Continuous Deployment (CI/CD)

### Option 1: Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v0
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy Backend
        run: |
          gcloud run deploy ticket-system-backend \
            --source . \
            --dockerfile Dockerfile.backend \
            --platform managed \
            --region us-central1
      
      - name: Deploy Frontend
        run: |
          gcloud run deploy ticket-system-frontend \
            --source . \
            --dockerfile Dockerfile.frontend \
            --platform managed \
            --region us-central1
```

---

## 🐛 Troubleshooting

### Issue: Deployment fails
**Solution:** Check logs with `gcloud run logs read [service-name]`

### Issue: Backend not connecting to Supabase
**Solution:** Verify environment variables are set correctly

```powershell
gcloud run services describe ticket-system-backend --format="value(status.conditions)"
```

### Issue: Frontend can't reach backend
**Solution:** 
1. Check CORS configuration in backend
2. Verify API URL in frontend config
3. Ensure backend service is public (`--allow-unauthenticated`)

### Issue: Port errors
**Solution:** Cloud Run requires port 8080. Our Dockerfiles are already configured correctly.

---

## 🎯 Custom Domain (Optional)

### Map your own domain:

```powershell
# Map domain to frontend
gcloud run domain-mappings create --service ticket-system-frontend --domain www.yourdomain.com

# Map domain to backend
gcloud run domain-mappings create --service ticket-system-backend --domain api.yourdomain.com
```

Then update DNS records as instructed.

---

## 📈 Scaling Configuration

### Auto-scaling settings:

```powershell
# Update backend with custom scaling
gcloud run services update ticket-system-backend `
  --min-instances 1 `
  --max-instances 100 `
  --concurrency 80 `
  --cpu-throttling `
  --memory 1Gi
```

- `min-instances`: Minimum running instances (0 for cost saving, 1+ for faster response)
- `max-instances`: Maximum instances to handle traffic spikes
- `concurrency`: Requests per instance
- `cpu-throttling`: Save costs when idle

---

## 🔧 Updating Your Application

### Deploy new version:

```powershell
# Just run the deploy command again!
gcloud run deploy ticket-system-backend --source .
```

Cloud Run automatically:
- Creates new revision
- Gradually shifts traffic
- Keeps old version for rollback

### Rollback if needed:

```powershell
# List revisions
gcloud run revisions list --service ticket-system-backend

# Rollback to previous revision
gcloud run services update-traffic ticket-system-backend --to-revisions=REVISION-NAME=100
```

---

## 📝 Quick Reference Commands

```powershell
# View all services
gcloud run services list

# Get service URL
gcloud run services describe ticket-system-backend --format="value(status.url)"

# View service details
gcloud run services describe ticket-system-backend

# Delete service
gcloud run services delete ticket-system-backend

# View billing
gcloud billing accounts list
gcloud billing projects describe your-ticket-system
```

---

## 🎉 Next Steps After Deployment

1. ✅ Test your application thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Set up CI/CD for automatic deployments
5. ✅ Enable Cloud Armor for DDoS protection
6. ✅ Set up Cloud CDN for faster content delivery
7. ✅ Configure backup strategy for Supabase

---

## 📞 Support

- **Google Cloud Documentation:** https://cloud.google.com/run/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Billing Support:** https://console.cloud.google.com/billing

---

## 🚀 Ready to Deploy?

Run these commands to get started:

```powershell
# 1. Login
gcloud auth login

# 2. Create project
gcloud projects create your-ticket-system

# 3. Enable services
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Deploy!
gcloud run deploy ticket-system-backend --source . --dockerfile Dockerfile.backend --allow-unauthenticated

# 5. Deploy frontend (after updating API URL)
gcloud run deploy ticket-system-frontend --source . --dockerfile Dockerfile.frontend --allow-unauthenticated
```

**Good luck with your deployment! 🎊**
