2. Create App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" → "Other" → Name it "AGS Solar"
4. Copy the 16-character password
5. Use in Supabase SMTP settings

## Step 2: Configure Redirect URLs (REQUIRED)

1. In Supabase Dashboard
2. Go to: **Authentication** → **URL Configuration**
3. Add these URLs to "Redirect URLs":
   ```
   http://localhost:3000/reset-password
   http://localhost:3000/*
   https://your-production-domain.com/reset-password
   https://your-production-domain.com/*
   ```
4. Click "Save"

## Step 3: Test the Feature

### **Testing Checklist:**
- [ ] Navigate to `http://localhost:3000/forgot-password`
- [ ] Enter a registered user's email
- [ ] Click "Send Reset Link" button
- [ ] Check email inbox (and spam folder)
- [ ] Click the reset link in email
- [ ] Should land on reset password page
- [ ] Enter new password (min 6 characters)
- [ ] Confirm password
- [ ] Click "Reset Password"
- [ ] Should see success message
- [ ] Should redirect to login after 2 seconds
- [ ] Login with new password
- [ ] ✅ SUCCESS!

## Step 4: Customize Email Template (Optional)

1. In Supabase: **Authentication** → **Email Templates**
2. Select "Reset Password" template
3. Customize the email content
4. Add your logo/branding
5. Click "Save"

## 🎯 Quick Test Commands

### Start your app:
```bash
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud\client"
npm start
```

### Access the pages:
- Forgot Password: http://localhost:3000/forgot-password
- Login: http://localhost:3000/login

## ⚠️ Common Issues & Quick Fixes

### Issue: Email not received
**Fix:** 
- Check spam folder
- Verify SMTP is configured
- Check Supabase email quota
- Wait 1-2 minutes for email delivery

### Issue: "Invalid or expired link"
**Fix:**
- Links expire after 1 hour - request new one
- Don't refresh reset page
- Clear browser cache

### Issue: Redirect URL error
**Fix:**
- Add your URL to Supabase redirect URLs list
- Include both localhost and production URLs

## 📋 What's Been Implemented

✅ ForgotPassword.tsx - Updated with Supabase
✅ ResetPassword.tsx - Created new page
✅ App.tsx - Added route for /reset-password
✅ Black button text for visibility
✅ Form validation
✅ Error handling
✅ Success messages
✅ Auto-redirect after success
✅ Professional UI design

## 🔐 Security Features

✅ Passwords never stored in plain text
✅ Token-based authentication
✅ Auto token expiration (1 hour)
✅ Single-use reset links
✅ User logged out after password change
✅ Secure password hashing by Supabase

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Check Supabase logs in dashboard
3. Verify email configuration
4. Test with real email account first

---

**Status:** ✅ CODE COMPLETE - Ready for Configuration
**Next Step:** Configure Supabase email settings
**Time to Complete:** 5-10 minutes for setup

🎉 **You're almost there! Just configure Supabase and test!**
