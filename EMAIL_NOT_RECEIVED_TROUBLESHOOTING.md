# EMAIL NOT RECEIVED - TROUBLESHOOTING GUIDE

## 🔍 Step 1: Check Supabase Email Configuration

### Go to Supabase Dashboard:
1. Visit: https://app.supabase.com
2. Login and select your project: **tlnojwnrvvrnujnhdlrr**
3. Go to: **Authentication** → **Email Templates**

### Verify "Reset Password" Template:
- [ ] Check if "Reset Password" template is **ENABLED**
- [ ] Check if "Confirm signup" is enabled (Supabase auth requires this)

---

## 🔍 Step 2: Check Email Provider Settings

### In Supabase Dashboard:
1. Go to: **Project Settings** (gear icon) → **Authentication**
2. Scroll to: **SMTP Settings**

### Check Current Setup:
- **Using Supabase Default Email?**
  - ⚠️ Has rate limits (3 emails per hour)
  - ⚠️ May be blocked by spam filters
  - ✅ Should work for testing

- **Using Custom SMTP?**
  - Check if SMTP is enabled
  - Verify credentials are correct

---

## 🔍 Step 3: Check URL Configuration

### In Supabase Dashboard:
1. Go to: **Authentication** → **URL Configuration**
2. Check "Redirect URLs" section

### Required URLs:
Add these if missing:
```
http://localhost:3000/**
http://localhost:3000/reset-password
```

### Site URL:
Should be: `http://localhost:3000`

---

## 🔍 Step 4: Test Email Delivery

### Check Browser Console:
1. Open browser (F12)
2. Go to **Console** tab
3. Try forgot password again
4. Look for errors

### Check Network Tab:
1. Open browser (F12)
2. Go to **Network** tab
3. Try forgot password again
4. Look for the API call to Supabase
5. Check the response - should be status 200

---

## 🔍 Step 5: Verify Email Address

### Important:
- [ ] Email must be **registered** in your system
- [ ] Check the exact email spelling
- [ ] Try with the email you used to register

### Test with Known Email:
1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Find a confirmed user email
4. Use that email for testing

---

## 🔍 Step 6: Check Spam/Junk Folder

- [ ] Check spam folder in email client
- [ ] Check junk folder
- [ ] Check promotions tab (Gmail)
- [ ] Wait 2-3 minutes for delivery

---

## 🔍 Step 7: Check Supabase Logs

### In Supabase Dashboard:
1. Go to: **Logs** (in left sidebar)
2. Select: **Auth Logs**
3. Look for password reset events
4. Check for any errors

---

## 🛠️ QUICK FIXES

### Fix 1: Enable Email Confirmations
1. Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Email**
3. Make sure "Enable email confirmations" is **OFF** for testing
4. Save

### Fix 2: Disable Email Rate Limiting (Testing)
1. Supabase Dashboard → **Authentication** → **Rate Limits**
2. Temporarily increase limits for testing

### Fix 3: Use Alternative Test Method
Try resetting password directly in Supabase:
1. Go to **Authentication** → **Users**
2. Find your user
3. Click the three dots (...)
4. Select "Send password reset email"
5. Check if you receive this email

---

## 🧪 ALTERNATIVE TESTING METHOD

### Test Supabase Email System:
```javascript
// Open browser console on your app
// Run this command:

const { data, error } = await window.supabase.auth.resetPasswordForEmail(
  'your-email@example.com',
  { redirectTo: 'http://localhost:3000/reset-password' }
);

console.log('Data:', data);
console.log('Error:', error);
```

If you get an error, it will show why email isn't sending.

---

## 📝 COMMON ISSUES & SOLUTIONS

### Issue 1: "Rate limit exceeded"
**Solution:** Wait 1 hour or configure custom SMTP

### Issue 2: "Invalid email"
**Solution:** Email not registered - register first

### Issue 3: "Email not confirmed"
**Solution:** 
- Supabase → Authentication → Users
- Manually confirm the user email

### Issue 4: No error but no email
**Solution:**
- Supabase is using default email (slow delivery)
- Wait 5-10 minutes
- Check spam folder
- Configure custom SMTP for faster delivery

---

## 🚀 RECOMMENDED: Setup Gmail SMTP (100% Reliable)

### Why?
- ✅ Faster delivery (instant)
- ✅ More reliable
- ✅ Higher rate limits
- ✅ Better spam score

### Setup Steps:
1. **Enable 2-Factor Auth on Gmail:**
   - https://myaccount.google.com/security

2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: Mail → Other (Custom name)
   - Name it: "AGS Solar Supabase"
   - Copy the 16-character password

3. **Configure in Supabase:**
   - Dashboard → Authentication → SMTP Settings
   - Enable Custom SMTP
   - **Host:** smtp.gmail.com
   - **Port:** 587
   - **Username:** your-email@gmail.com
   - **Password:** [16-char app password]
   - **Sender Email:** your-email@gmail.com
   - **Sender Name:** AGS Solar
   - Save

4. **Test Again:**
   - Try forgot password
   - Should receive email in 5-10 seconds

---

## 📞 NEED IMMEDIATE HELP?

### Quick Debug Steps:
1. Check browser console for errors
2. Check Supabase logs
3. Verify email is registered
4. Check spam folder
5. Try manual reset from Supabase dashboard

### Share This Info:
- Any error messages in console?
- What's in Supabase Auth Logs?
- Is the user email confirmed?
- Using default or custom SMTP?

---

**Most Common Solution:** Setup Gmail SMTP - Takes 5 minutes and works 100% of the time!
