# Pre-Deployment Checklist

## 📋 Before You Deploy

### Google Cloud Setup
- [ ] Google Cloud account created
- [ ] Billing enabled (get $300 free credits)
- [ ] Google Cloud CLI installed
- [ ] Logged in with `gcloud auth login`
- [ ] Project created
- [ ] Project ID noted down: _______________

### Environment Configuration
- [ ] Supabase project set up and working
- [ ] Database schema deployed
- [ ] Environment variables documented
- [ ] API keys and secrets secured
- [ ] CORS origins configured

### Code Review
- [ ] All features working locally
- [ ] No console errors
- [ ] Tests passing (if applicable)
- [ ] Code committed to Git
- [ ] Dependencies up to date

### Configuration Files
- [ ] `Dockerfile.backend` present in root
- [ ] `Dockerfile.frontend` present in root
- [ ] `.dockerignore` created
- [ ] `nginx.conf` in gcp-deployment folder
- [ ] No sensitive data in code (all in .env)

---

## 🚀 Deployment Steps

### Step 1: Initial Setup
- [ ] Run `gcloud auth login`
- [ ] Run `gcloud config set project YOUR_PROJECT_ID`
- [ ] Run `gcloud services enable run.googleapis.com cloudbuild.googleapis.com`

### Step 2: Deploy Backend
- [ ] Run deployment script or manual command
- [ ] Backend URL received: _______________
- [ ] Backend accessible and responding
- [ ] Check logs for errors
- [ ] Test API endpoints

### Step 3: Update Frontend Config
- [ ] Located API configuration file
- [ ] Updated API_URL to backend URL
- [ ] Saved changes
- [ ] Committed changes

### Step 4: Deploy Frontend
- [ ] Run frontend deployment command
- [ ] Frontend URL received: _______________
- [ ] Frontend accessible in browser
- [ ] Check browser console for errors
- [ ] Test login functionality

---

## ✅ Post-Deployment Verification

### Functionality Tests
- [ ] Can access frontend URL
- [ ] Can access backend URL
- [ ] Login works correctly
- [ ] Dashboard loads properly
- [ ] Can create tickets
- [ ] Can view tickets
- [ ] Can update tickets
- [ ] Can delete tickets
- [ ] All filters working
- [ ] Reports generating correctly
- [ ] User management working
- [ ] No console errors

### Performance Checks
- [ ] Page loads in <3 seconds
- [ ] API responses in <1 second
- [ ] No timeout errors
- [ ] Images loading correctly
- [ ] CSS styling correct

### Security Checks
- [ ] HTTPS enabled (automatic with Cloud Run)
- [ ] CORS working correctly
- [ ] Authentication working
- [ ] Authorization working
- [ ] No sensitive data exposed in responses
- [ ] Environment variables not in code

### Monitoring Setup
- [ ] Access to Cloud Console
- [ ] Can view logs
- [ ] Can see metrics
- [ ] Billing alerts configured
- [ ] Error notifications set up (optional)

---

## 💰 Cost Management

### Initial Setup
- [ ] Billing account linked
- [ ] Budget alerts configured
- [ ] Free tier limits understood
- [ ] Estimated monthly cost noted: $_______

### Optimization
- [ ] Min instances set appropriately (0 for cost saving)
- [ ] Max instances set appropriately
- [ ] Memory allocation optimized
- [ ] CPU allocation optimized
- [ ] Unnecessary services disabled

---

## 📝 Documentation

### URLs and Credentials
- [ ] Project ID documented: _______________
- [ ] Backend URL documented: _______________
- [ ] Frontend URL documented: _______________
- [ ] Admin credentials secured
- [ ] Database credentials secured
- [ ] API keys backed up

### Team Communication
- [ ] Team notified of new URLs
- [ ] Documentation shared
- [ ] Access granted to team members
- [ ] Deployment process documented

---

## 🔄 Ongoing Maintenance

### Weekly Tasks
- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Monitor costs
- [ ] Check for security updates

### Monthly Tasks
- [ ] Review and optimize costs
- [ ] Update dependencies
- [ ] Backup database
- [ ] Test disaster recovery
- [ ] Review and update documentation

### As Needed
- [ ] Deploy new features
- [ ] Rollback if issues occur
- [ ] Scale resources
- [ ] Update configuration

---

## 🆘 Emergency Contacts

### Support Resources
- Google Cloud Support: https://console.cloud.google.com/support
- Supabase Support: https://supabase.com/support
- Team Contact: _______________

### Quick Commands
```powershell
# View logs
gcloud run logs read ticket-system-backend

# Rollback
gcloud run services update-traffic ticket-system-backend --to-revisions=PREVIOUS-REVISION=100

# Check status
gcloud run services list

# Update service
gcloud run deploy ticket-system-backend --source .
```

---

## ✨ Optional Enhancements

### Nice to Have
- [ ] Custom domain configured
- [ ] CDN enabled
- [ ] CI/CD pipeline set up
- [ ] Staging environment created
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] Automated backups configured
- [ ] Monitoring dashboard created
- [ ] Email notifications set up
- [ ] Rate limiting implemented
- [ ] DDoS protection enabled

---

## 🎉 Deployment Complete!

**Congratulations!** If all items above are checked, your application is successfully deployed and running on Google Cloud Platform!

### Next Steps:
1. Share URLs with your team
2. Monitor performance for the first week
3. Gather user feedback
4. Plan for scaling if needed
5. Set calendar reminders for maintenance tasks

**Date Deployed:** _______________
**Deployed By:** _______________
**Notes:** 
_______________________________________________
_______________________________________________
_______________________________________________

---

**Keep this checklist for future reference and updates!**
