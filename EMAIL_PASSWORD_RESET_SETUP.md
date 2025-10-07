# 📧 EMAIL PASSWORD RESET - COMPLETE SETUP GUIDE

## ✅ What's Ready

I've implemented email sending for password reset! Now users will receive actual emails.

---

## 🚀 SETUP STEPS (5-10 Minutes)

### **Step 1: Get Gmail App Password**

1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification"
   - Turn it ON if not already enabled

2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Or Google: "gmail app password"
   - Select "Mail" from dropdown
   - Select "Other (Custom name)"
   - Type: **AGS Solar Password Reset**
   - Click "Generate"
   - **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

### **Step 2: Update .env File**

Open: `C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud\.env`

Find these lines at the bottom:
```env
# EMAIL CONFIGURATION (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
EMAIL_FROM="AGS Solar" <your-email@gmail.com>
```

**Replace with YOUR details:**
```env
# EMAIL CONFIGURATION (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM="AGS Solar" <youremail@gmail.com>
```

**Example:**
```env
EMAIL_USER=john@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM="AGS Solar" <john@gmail.com>
```

### **Step 3: Restart Backend Server**

```bash
# Stop current server (Ctrl+C in backend terminal)
# Then start again:
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"
npm start
```

### **Step 4: Test It!**

1. Go to: http://localhost:3000/forgot-password
2. Enter your registered email
3. Click "Send Reset Link"
4. **Check your email inbox!** (and spam folder)
5. You should receive email within 10-30 seconds
6. Click the link in email
7. Reset your password
8. Done! ✅

---

## 📧 What The Email Looks Like

**Subject:** Reset Your Password - AGS Solar

**Email Content:**
```
🔒 Password Reset

Hi [Your Name],

Click the button below to reset your password:

[Reset Password Button]

Or copy this link:
http://localhost:3000/reset-password?token=...

⏰ Link expires in 1 hour.

If you didn't request this, ignore this email.

Best regards,
AGS Solar Team
```

---

## 🔧 What I Implemented

### **1. Email Utility** (`/server/utils/email.js`)
- Nodemailer configuration
- Beautiful HTML email template
- Professional styling (purple gradient theme)
- Plain text fallback

### **2. Updated Auth Routes** (`/server/routes/auth.js`)
- Integrated email sending
- Error handling
- Fallback to show link if email fails (testing)

### **3. Environment Variables** (`.env`)
- Added email configuration
- Gmail SMTP settings
- Ready for your credentials

---

## 🎨 Email Features

✅ **Professional Design:**
- Purple gradient header
- Clean white card layout
- Prominent "Reset Password" button
- Easy-to-read formatting

✅ **User-Friendly:**
- Clear instructions
- Clickable button
- Copy-paste link as backup
- 1-hour expiry warning

✅ **Security:**
- Secure token system
- One-time use links
- 1-hour expiration
- No password in email

---

## ⚠️ Troubleshooting

### **Email Not Received?**

**Check 1: Spam Folder**
- Gmail sometimes filters automated emails
- Check "Promotions" tab too

**Check 2: Correct Email**
- Make sure you're using registered email
- Check spelling

**Check 3: App Password**
- Make sure it's 16 characters
- No spaces needed (Gmail removes them)
- Generated from correct Google account

**Check 4: 2FA Enabled**
- App passwords only work with 2FA on

**Check 5: Backend Logs**
- Check terminal for error messages
- Look for "✅ Email sent" or "❌ Email error"

### **"Invalid credentials" Error?**

**Solution:**
- Double-check EMAIL_USER is correct
- Double-check EMAIL_PASS is the app password (not your regular password)
- Make sure no extra spaces in .env file

### **"Connection timeout" Error?**

**Solution:**
- Check internet connection
- Try port 465 instead of 587 (change EMAIL_PORT)
- Some networks block SMTP - try different network

---

## 📝 Testing Checklist

- [ ] Generated Gmail app password
- [ ] Updated .env with email credentials
- [ ] Restarted backend server
- [ ] Went to forgot password page
- [ ] Entered registered email
- [ ] Submitted form
- [ ] Checked email inbox (and spam)
- [ ] Received email within 30 seconds
- [ ] Clicked reset link
- [ ] Entered new password
- [ ] Successfully reset password
- [ ] Logged in with new password
- [ ] ✅ SUCCESS!

---

## 🔐 Security Notes

✅ **App Password is Safe:**
- Only works for this app
- Can be revoked anytime
- Doesn't give access to your Gmail

✅ **Keep Secret:**
- Never share your app password
- Don't commit .env to Git
- .env is in .gitignore

✅ **Production Ready:**
- Same setup works for production
- Just update frontend URL in auth.js
- Consider using custom domain email

---

## 🎯 Next Steps (Optional)

### **For Production:**
1. Replace `localhost` with your domain in `auth.js`
2. Use environment variable for frontend URL
3. Consider using a dedicated email service (SendGrid, AWS SES)

### **Custom Domain Email:**
- Use company@yourdomain.com instead
- More professional
- Better deliverability

---

## 📞 Need Help?

**If email still not working:**
1. Check backend terminal for errors
2. Verify .env file has correct values
3. Test with different email address
4. Check Gmail account security settings

---

**Status:** ✅ CODE COMPLETE - Just Need Your Gmail Credentials!

**Time to Setup:** 5-10 minutes

🎉 **You're 3 steps away from working password reset emails!**

1. Get Gmail app password
2. Update .env file
3. Restart server & test!
