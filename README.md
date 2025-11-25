# Google Cloud Platform Deployment Files

This folder contains everything you need to deploy your Ticket Tracking System to Google Cloud Platform.

## 📁 Files Overview

| File | Description |
|------|-------------|
| `QUICK_START.md` | **START HERE** - Simple step-by-step guide |
| `DEPLOYMENT_GUIDE.md` | Comprehensive deployment documentation |
| `deploy-to-gcp.ps1` | Automated PowerShell deployment script |
| `nginx.conf` | Nginx configuration for frontend |
| `Dockerfile.backend` | Docker configuration for backend (in root) |
| `Dockerfile.frontend` | Docker configuration for frontend (in root) |

## 🚀 Quick Deployment

1. **Install Google Cloud CLI**: https://cloud.google.com/sdk/docs/install

2. **Login to Google Cloud**:
   ```powershell
   gcloud auth login
   ```

3. **Create Project**:
   ```powershell
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

4. **Run Deployment Script**:
   ```powershell
   .\gcp-deployment\deploy-to-gcp.ps1 -ProjectId "your-project-id"
   ```

## 📖 Documentation

- **For beginners**: Read `QUICK_START.md`
- **For advanced users**: Read `DEPLOYMENT_GUIDE.md`

## 💰 Estimated Costs

- **Free Tier**: First 2 million requests/month FREE
- **Low-Medium Traffic**: $7-23/month
- **Enterprise Scale**: Custom pricing

## 🆘 Need Help?

1. Check the documentation files in this folder
2. Visit: https://cloud.google.com/run/docs
3. Check logs: `gcloud run logs read service-name`

## ✅ What's Included

- ✅ Automated deployment scripts
- ✅ Docker configurations
- ✅ Nginx setup for frontend
- ✅ Environment variable management
- ✅ Security best practices
- ✅ Cost optimization tips
- ✅ Monitoring and logging setup
- ✅ CI/CD examples
- ✅ Troubleshooting guide

---

**Ready to deploy? Start with `QUICK_START.md`! 🎉**
