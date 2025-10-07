# CUSTOM BACKEND PASSWORD RESET - SETUP GUIDE

## 🎯 What I've Implemented

Since you're using **custom backend authentication** (not Supabase Auth), I've created a complete password reset system for your backend.

---

## ✅ FILES UPDATED/CREATED

### **Backend:**
1. `/server/routes/auth.js` - Added 2 new routes:
   - `POST /auth/forgot-password` - Generates reset token
   - `POST /auth/reset-password` - Resets password with token

2. `/migrations/add_password_reset_columns.sql` - Database migration

### **Frontend:**
1. `/client/src/pages/ForgotPassword.tsx` - Updated to use backend API
2. `/client/src/pages/ResetPassword.tsx` - Updated to use backend API
3. `/client/src/App.tsx` - Already has route (no changes needed)

---

## 🚀 SETUP STEPS (REQUIRED)

### **Step 1: Run Database Migration**

You need to add 2 columns to your `users` table:

**Option A: Run SQL in Supabase Dashboard** (EASIEST)
1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **SQL Editor**
4. Click "New Query"
5. Paste this SQL:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
```

6. Click "Run" or press Ctrl+Enter
7. Should see "Success. No rows returned"

**Option B: Check the migration file**
- File created at: `/migrations/add_password_reset_columns.sql`
- Copy and run in Supabase SQL Editor

### **Step 2: Restart Backend Server**

```bash
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"
# Stop current server (Ctrl+C if running)
npm start
```

### **Step 3: Restart Frontend**

```bash
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud\client"
# Stop current server (Ctrl+C if running)
npm start
```

---

## 🧪 TESTING (No Email Needed!)

### **How It Works (Testing Mode):**
1. User goes to `/forgot-password`
2. Enters email
3. Backend generates reset token
4. **FOR TESTING:** Token is shown directly on the page (no email needed!)
5. User clicks the reset link
6. User enters new password
7. Password is updated ✅

### **Test Steps:**

1. **Navigate to Forgot Password:**
   - Go to: http://localhost:3000/forgot-password

2. **Enter Your Email:**
   - Use an email that's already registered
   - To check registered emails:
     - Supabase Dashboard → Table Editor → users table

3. **Click "Send Reset Link":**
   - You'll see a success message
   - **A clickable reset link will appear on the page** (testing mode only!)

4. **Click the Reset Link:**
   - It will take you to the reset password page
   - Token is automatically included in URL

5. **Enter New Password:**
   - Type new password (min 6 characters)
   - Confirm password
   - Click "Reset Password"

6. **Success!:**
   - Should see success message
   - Auto-redirect to login after 2 seconds
   - Login with new password

---

## 🔒 SECURITY FEATURES

✅ Reset tokens are **hashed** before storing
✅ Tokens expire after **1 hour**
✅ Tokens are **single-use** (deleted after password reset)
✅ Passwords are **bcrypt hashed**
✅ No email enumeration (always returns success message)
✅ Token validation on backend

---

## 📧 ADDING EMAIL (Production)

Currently, the reset link appears on screen for testing. For production, you need to send emails.

### **Options:**

**Option 1: SendGrid (Recommended)**
- Free tier: 100 emails/day
- Easy to set up
- Reliable delivery

**Option 2: Nodemailer + Gmail**
- Use Gmail SMTP
- Free
- Good for small apps

**Option 3: Mailgun, AWS SES, etc.**
- More advanced options

### **To Add Email Sending:**

1. Install email package:
```bash
cd server
npm install nodemailer
```

2. In `/server/routes/auth.js`, find the TODO comment:
```javascript
// TODO: Send email with reset link
```

3. Add email sending code there

4. Remove the testing code that returns the token in response

---

## 🔧 API ENDPOINTS

### **POST /api/auth/forgot-password**
Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "If that email exists, a password reset link has been sent",
  "resetToken": "abc123..." // TESTING ONLY
}
```

### **POST /api/auth/reset-password**
Request:
```json
{
  "token": "abc123...",
  "password": "newPassword123"
}
```

Response:
```json
{
  "message": "Password has been reset successfully"
}
```

---

## ⚠️ TROUBLESHOOTING

### Issue: "User not found"
**Solution:** Make sure the email is registered
- Check Supabase → Table Editor → users table

### Issue: "Invalid or expired token"
**Solutions:**
- Token expires after 1 hour - request new one
- Each token can only be used once
- Make sure you're using the full token from URL

### Issue: Database error
**Solution:** Run the SQL migration first (Step 1 above)

### Issue: Backend not responding
**Solutions:**
- Make sure backend server is running on port 5001
- Check terminal for errors
- Restart backend server

---

## 📝 TESTING CHECKLIST

- [ ] Run SQL migration in Supabase
- [ ] Restart backend server
- [ ] Restart frontend
- [ ] Navigate to /forgot-password
- [ ] Enter registered email
- [ ] See success message with reset link
- [ ] Click reset link
- [ ] Enter new password
- [ ] Confirm password
- [ ] Submit
- [ ] See success message
- [ ] Redirect to login
- [ ] Login with new password
- [ ] ✅ SUCCESS!

---

## 🎉 WHAT'S WORKING

✅ **Backend API routes created**
✅ **Database schema ready** (after migration)
✅ **Frontend pages updated**
✅ **Token generation and validation**
✅ **Password hashing**
✅ **Security measures implemented**
✅ **Testing mode with visible links**
✅ **Professional UI**

---

## 📞 SUPPORT

If you encounter issues:
1. Check backend terminal for errors
2. Check browser console (F12)
3. Verify database migration ran successfully
4. Make sure both servers are running
5. Verify email exists in users table

---

**Status:** ✅ COMPLETE - Ready for Testing (No Email Required!)
**Next Step:** Run SQL migration and test the flow
**Time to Setup:** 2-3 minutes

🎉 **No email configuration needed for testing! The reset link appears on screen!**
