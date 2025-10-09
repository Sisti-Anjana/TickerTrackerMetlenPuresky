# 🎯 HOW TO CREATE USER ACCOUNTS - COMPLETE GUIDE

## 📋 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Login as Admin ✅

1. Open your browser
2. Go to: **http://localhost:3001**
3. You'll see the login type selection page
4. Click the **"Admin Login"** card (purple one on the left)
5. Enter your admin credentials:
   ```
   Email:    admin@system.local
   Password: Admin@123
   ```
6. Click **"Login as Admin"**
7. You'll be redirected to the dashboard

---

### STEP 2: Find the Admin Panel 👑

After logging in, look at the **LEFT SIDEBAR**.

You should see these menu items:
- Dashboard
- Create New Ticket
- All Tickets
- My Tickets
- Reports
- Team Performance
- Source
- **👑 Admin Panel** ← This is what you're looking for!

**If you don't see "👑 Admin Panel":**
- Make sure you logged in using **Admin Login** (not User Login)
- Check the browser console (F12) for any errors
- Verify your database migration ran successfully

---

### STEP 3: Open Admin Panel 🔓

Click on **"👑 Admin Panel"** in the sidebar.

You'll see the Admin Panel page with:
- A **"Create New User"** button at the top right
- A list of **"Existing Users"** showing all users in the system

---

### STEP 4: Create a New User ➕

Click the **"Create New User"** button.

A modal (popup) will appear with a form:

```
┌─────────────────────────────────────┐
│  👤 Create New User Account         │
├─────────────────────────────────────┤
│                                     │
│  Full Name                          │
│  [_________________________]        │
│                                     │
│  Email Address                      │
│  [_________________________]        │
│                                     │
│  Temporary Password        [👁️]     │
│  [_________________________]        │
│  [🔑 Generate Random Password]      │
│                                     │
│  ℹ️ User will be required to       │
│     change this password on         │
│     first login                     │
│                                     │
│  [Cancel] [Create User Account]    │
└─────────────────────────────────────┘
```

---

### STEP 5: Fill in User Information 📝

**Example:**

1. **Full Name:** John Doe
2. **Email Address:** john@company.com
3. **Temporary Password:** 
   - **Option A:** Click **"Generate Random Password"** button
     - This creates a secure random password like: `kJ8n#mP2qR`
   - **Option B:** Type your own password
     - Must be at least 6 characters
     - Example: `Welcome123`

---

### STEP 6: Create the Account ✅

Click the **"Create User Account"** button.

The system will:
- Create the user account
- Hash the password securely
- Set the account to require password change on first login

---

### STEP 7: Save the Credentials 💾

**IMPORTANT:** A success modal will appear:

```
┌─────────────────────────────────────┐
│       ✅ User Account Created!      │
│                                     │
│  Please save these credentials and  │
│  provide them to the user.          │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Email                         │ │
│  │ john@company.com     [📋 Copy]│ │
│  │                               │ │
│  │ Temporary Password            │ │
│  │ kJ8n#mP2qR           [📋 Copy]│ │
│  └───────────────────────────────┘ │
│                                     │
│  ⚠️ Make sure to save these        │
│     credentials now. You won't be   │
│     able to see the password again! │
│                                     │
│  [I've Saved the Credentials]      │
└─────────────────────────────────────┘
```

**ACTION REQUIRED:**
1. Click the **[📋 Copy]** button next to the email
2. Save it somewhere (notepad, password manager, etc.)
3. Click the **[📋 Copy]** button next to the password
4. Save it next to the email
5. Click **"I've Saved the Credentials"**

---

### STEP 8: Share Credentials with User 📧

Send the credentials to the user via:
- ✅ Encrypted email
- ✅ Secure messaging (Signal, WhatsApp, etc.)
- ✅ In-person (write it down securely)
- ❌ **NOT via plain text email** (insecure!)

**Example message to user:**

```
Hi John,

Your account has been created for the AGS Ticketing System.

Login here: http://localhost:3001

Click "User Login" and use these credentials:
Email: john@company.com
Password: kJ8n#mP2qR

You will be asked to change your password on first login.

Let me know if you have any issues!
```

---

## 👤 USER'S FIRST LOGIN EXPERIENCE

### What the User Does:

1. **Goes to:** http://localhost:3001
2. **Clicks:** "User Login" (blue card on the right)
3. **Enters the credentials** you provided
4. **Clicks:** "Login"

### Password Change Screen:

The system automatically shows:

```
┌─────────────────────────────────────┐
│     🔄 Change Password              │
│                                     │
│  Please set a new password to       │
│  continue                           │
│                                     │
│  New Password                       │
│  [_________________________]        │
│                                     │
│  Confirm New Password               │
│  [_________________________]        │
│                                     │
│  ℹ️ Password must be at least      │
│     6 characters                    │
│                                     │
│  [Change Password & Continue]      │
└─────────────────────────────────────┘
```

### User's Actions:

1. Enter a **new password** (minimum 6 characters)
2. **Confirm** the new password (type it again)
3. Click **"Change Password & Continue"**

### Result:

✅ User's password is changed
✅ User is logged in
✅ User is redirected to the dashboard
✅ User can now use the system normally

---

## 🎯 VISUAL FLOW DIAGRAM

```
ADMIN CREATES USER
       ↓
Admin Panel → Click "Create New User"
       ↓
Fill form (Name, Email, Password)
       ↓
Click "Create User Account"
       ↓
Copy credentials from success modal
       ↓
Share credentials with user
       ↓

USER FIRST LOGIN
       ↓
User goes to: http://localhost:3001
       ↓
User clicks "User Login"
       ↓
User enters provided credentials
       ↓
System detects: must_change_password = true
       ↓
System shows "Change Password" screen
       ↓
User sets new password
       ↓
User clicks "Change Password & Continue"
       ↓
✅ User is logged in and ready to use system!
```

---

## 🔍 TROUBLESHOOTING

### "I don't see Admin Panel in sidebar"

**Possible causes:**
1. You logged in as a user, not admin
   - **Solution:** Logout and use Admin Login
2. Your user account doesn't have admin role
   - **Solution:** Check database: `SELECT role FROM users WHERE email = 'admin@system.local'`
3. Browser cache issue
   - **Solution:** Hard refresh (Ctrl+Shift+R) or clear cache

### "Create New User button doesn't work"

**Check:**
1. Open browser console (F12)
2. Look for any error messages
3. Make sure backend is running on port 5001

### "User can't login"

**Verify:**
1. User is using **User Login** (not Admin Login)
2. Email and password are exactly as created
3. No extra spaces in email or password
4. User account was created successfully (check Existing Users list)

### "Password change doesn't work"

**Check:**
1. New password is at least 6 characters
2. Both password fields match
3. Check browser console for errors

---

## 📊 EXAMPLE SCENARIO

### Creating 3 Users:

**User 1:**
- Name: Sarah Johnson
- Email: sarah@company.com
- Password: (Generate Random) → `Xy7#pL2nM`

**User 2:**
- Name: Mike Chen  
- Email: mike@company.com
- Password: (Generate Random) → `Qw9@kR5tB`

**User 3:**
- Name: Lisa Smith
- Email: lisa@company.com
- Password: (Generate Random) → `Zx4$hN8vC`

### Sharing Credentials:

Send each user their individual credentials via secure channel.

### Result:

All 3 users can:
1. Login with their temporary passwords
2. Change their passwords
3. Start using the ticketing system

---

## ✅ CHECKLIST FOR CREATING USER

- [ ] Logged in as admin
- [ ] Opened Admin Panel from sidebar
- [ ] Clicked "Create New User"
- [ ] Entered user's full name
- [ ] Entered user's email address
- [ ] Generated or entered temporary password
- [ ] Clicked "Create User Account"
- [ ] Copied email from success modal
- [ ] Copied password from success modal
- [ ] Saved credentials securely
- [ ] Shared credentials with user via secure channel
- [ ] Informed user they need to change password on first login

---

## 🎊 YOU'RE ALL SET!

Now you know how to:
✅ Access the Admin Panel
✅ Create user accounts
✅ Generate secure passwords
✅ Share credentials safely
✅ Guide users through first login

**Start creating your team's accounts!** 🚀

---

**Need more help?** Check these files:
- `ADMIN_CREDENTIALS.txt` - Your admin login info
- `ALL_DONE.md` - Complete system guide
- `QUICK_REFERENCE.txt` - Quick reference card