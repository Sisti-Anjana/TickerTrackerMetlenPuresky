# 🚀 Quick Start - Google Cloud Deployment

## Prerequisites Checklist

- [ ] Google Cloud account created
- [ ] Billing enabled (you get $300 free credits)
- [ ] Google Cloud CLI installed
- [ ] Logged in to gcloud (`gcloud auth login`)

## Step-by-Step Deployment

### 1️⃣ Install Google Cloud CLI (if not installed)

**Windows:**
1. Download from: https://cloud.google.com/sdk/docs/install
2. Run the installer
3. Open a new PowerShell window
4. Verify: `gcloud --version`

### 2️⃣ Login to Google Cloud

```powershell
gcloud auth login
```

This will open your browser. Select your Google account.

### 3️⃣ Create a New Project

```powershell
# Choose a unique project ID (lowercase, numbers, hyphens only)
gcloud projects create ticket-system-2024 --name="Ticket System"

# Set as active project
gcloud config set project ticket-system-2024

# Enable billing (required)
# Visit: https://console.cloud.google.com/billing
# Link your billing account to the project
```

### 4️⃣ Run the Automated Deployment Script

```powershell
# Navigate to your project
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"

# Run deployment
.\gcp-deployment\deploy-to-gcp.ps1 -ProjectId "ticket-system-2024"
```

### 5️⃣ Update Frontend Configuration

After backend deploys, you'll get a URL like:
`https://ticket-system-backend-xxxxx-uc.a.run.app`
gcloud run deploy ticket-system-backend --source .
gcloud run deploy ticket-system-frontend --source .
```

---

## 💰 Cost Management

### Free Tier Limits (Monthly):
- 2 million requests FREE
- 180,000 vCPU-seconds FREE
- 360,000 GB-seconds memory FREE

### Estimated Costs:
- **Low traffic:** $0-5/month (within free tier)
- **Medium traffic:** $5-15/month
- **High traffic:** $15-50/month

### Cost Saving Tips:
```powershell
# Set minimum instances to 0 (scales to zero when not used)
gcloud run services update ticket-system-backend --min-instances 0

# Set lower memory if possible
gcloud run services update ticket-system-backend --memory 256Mi
```

---

## 📊 Monitoring

### View Your Services:
```powershell
# List all services
gcloud run services list

# Get service details
gcloud run services describe ticket-system-backend

# View recent logs
gcloud run logs read ticket-system-backend --limit 50

# Stream live logs
gcloud run logs tail ticket-system-backend
```

### Cloud Console Dashboard:
Visit: https://console.cloud.google.com/run

Here you can:
- View metrics (requests, latency, errors)
- Check logs in real-time
- Monitor costs
- Manage services

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions Deployment:

1. Create service account:
```powershell
gcloud iam service-accounts create github-deployer

gcloud projects add-iam-policy-binding ticket-system-2024 \
    --member="serviceAccount:github-deployer@ticket-system-2024.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# Create and download key
gcloud iam service-accounts keys create key.json \
    --iam-account=github-deployer@ticket-system-2024.iam.gserviceaccount.com
```

2. Add to GitHub Secrets:
   - `GCP_PROJECT_ID`: your-project-id
   - `GCP_SA_KEY`: contents of key.json

3. Create `.github/workflows/deploy.yml` (already provided in the guide)

---

## 🌐 Custom Domain (Optional)

### Add your own domain:

```powershell
# For frontend
gcloud run domain-mappings create \
    --service ticket-system-frontend \
    --domain www.yourdomain.com

# For backend (API)
gcloud run domain-mappings create \
    --service ticket-system-backend \
    --domain api.yourdomain.com
```

Then update your DNS records as instructed by Google Cloud.

---

## 🔒 Security Enhancements

### 1. Use Secret Manager for sensitive data:

```powershell
# Create secrets
echo "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

# Deploy with secret
gcloud run deploy ticket-system-backend \
    --set-secrets="JWT_SECRET=jwt-secret:latest"
```

### 2. Enable Cloud Armor (DDoS protection):

```powershell
gcloud compute security-policies create ticket-system-policy
gcloud run services update ticket-system-frontend \
    --vpc-egress all-traffic
```

### 3. Set up IAM roles:

```powershell
# Restrict who can deploy
gcloud projects add-iam-policy-binding ticket-system-2024 \
    --member="user:your-email@example.com" \
    --role="roles/run.developer"
```

---

## 📈 Performance Optimization

### Enable CDN:
```powershell
gcloud compute backend-services update ticket-system-frontend \
    --enable-cdn \
    --cache-mode=CACHE_ALL_STATIC
```

### Configure Auto-scaling:

```powershell
# Scale from 1 to 100 instances based on traffic
gcloud run services update ticket-system-backend \
    --min-instances 1 \
    --max-instances 100 \
    --concurrency 80
```

### Set up Health Checks:

```powershell
gcloud run services update ticket-system-backend \
    --cpu-throttling \
    --timeout 300s
```

---

## 🎯 Common Commands Reference

```powershell
# View all services
gcloud run services list

# Get service URL
gcloud run services describe ticket-system-backend --format="value(status.url)"

# Update environment variable
gcloud run services update ticket-system-backend \
    --set-env-vars "NEW_VAR=value"

# View logs
gcloud run logs read ticket-system-backend --limit 50

# Delete service
gcloud run services delete ticket-system-backend

# Rollback to previous version
gcloud run revisions list --service ticket-system-backend
gcloud run services update-traffic ticket-system-backend --to-revisions=REVISION-NAME=100

# View billing
gcloud billing accounts list
```

---

## 🆘 Getting Help

### Official Resources:
- Google Cloud Run Docs: https://cloud.google.com/run/docs
- Pricing Calculator: https://cloud.google.com/products/calculator
- Support: https://console.cloud.google.com/support

### Community:
- Stack Overflow: Tag `google-cloud-run`
- Google Cloud Community: https://www.googlecloudcommunity.com

---

## ✅ Deployment Checklist

Before going live:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Frontend API URL updated with backend URL
- [ ] All environment variables configured
- [ ] CORS enabled on backend
- [ ] Database (Supabase) connected and working
- [ ] All features tested
- [ ] Logs checked for errors
- [ ] Monitoring set up
- [ ] SSL/HTTPS working (automatic with Cloud Run)
- [ ] Custom domain configured (if needed)
- [ ] Billing alerts set up
- [ ] Backup strategy in place

---

## 🎉 Success!

Your application is now running on Google Cloud!

**What's Next?**
1. Test all functionality thoroughly
2. Monitor performance and costs
3. Set up automatic backups
4. Configure monitoring alerts
5. Consider setting up staging environment
6. Document your deployment process

**Need help?** Check the detailed `DEPLOYMENT_GUIDE.md` in the same folder!

---

**Happy Deploying! 🚀**
