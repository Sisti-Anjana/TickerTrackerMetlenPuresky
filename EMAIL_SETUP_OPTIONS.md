# EMAIL SETUP GUIDE - Gmail with Nodemailer

## 🚀 Quick Setup (10 minutes)

### Step 1: Install Nodemailer

```bash
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"
npm install nodemailer
```

### Step 2: Get Gmail App Password

1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" from dropdown
   - Select "Other (Custom name)"
   - Type: "AGS Solar Password Reset"
   - Click "Generate"
   - **Copy the 16-character password** (spaces don't matter)

### Step 3: Add to .env File

Add these lines to your root `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=AGS Solar <your-email@gmail.com>
```

### Step 4: I'll Update the Code

Let me know and I'll add the email sending code to your backend!

---

## 🔧 Alternative Options

### **Option 2: SendGrid (More Professional)**
- Free tier: 100 emails/day
- Better deliverability
- More reliable
- Takes 15 minutes to setup

### **Option 3: Keep Testing Mode**
- No email needed
- Perfect for development
- Users see the reset link on screen
- Can deploy to production and add email later

---

## 💡 Recommendation

**For now:** Keep testing mode - it works perfectly!

**For production:** Use Gmail (Option 1) or SendGrid (Option 2)

---

**Do you want me to implement email sending now? If yes, which option:**
1. Gmail/Nodemailer (easiest, I can do it in 5 minutes)
2. SendGrid (more professional)
3. Keep testing mode for now
