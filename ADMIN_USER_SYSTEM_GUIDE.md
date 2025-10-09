# Admin and User Authentication System - Setup Guide

## 🎯 Overview

Your ticketing system now has a complete admin and user authentication system with the following features:

### ✨ Key Features:
1. **Login Type Selection** - Users choose between Admin or User login
2. **Admin Login** - Separate login for administrators
3. **User Login** - Standard login for team members
4. **Admin Panel** - Admins can create user accounts
5. **Password Management** - Users must change password on first login
6. **Role-Based Access** - Different permissions for admins and users

---

## 🚀 Setup Instructions

### Step 1: Update the Database

Run the migration to add roles and create the admin account:

```sql
-- Run this SQL in your Supabase SQL Editor
-- File: migrations/06_add_admin_and_user_roles.sql
```

OR execute it directly:

```bash
psql -h your-supabase-host -U postgres -d postgres -f migrations/06_add_admin_and_user_roles.sql
```

### Step 2: Verify Admin Account

After running the migration, you should have:

**Admin Credentials:**
- **Email:** admin@system.local
- **Password:** Admin@123
- **Role:** admin

### Step 3: Install Dependencies (Already Done)

The lucide-react package has been installed for icons.

### Step 4: Start the Application

```bash
# Terminal 1 - Start Backend
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"
npm start

# Terminal 2 - Start Frontend  
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud\client"
npm start
```

---

## 📱 User Flow

### For Administrators:

1. **Access the App** → Go to http://localhost:3001
2. **Select Login Type** → Click "Admin Login"
3. **Login** → Use admin@system.local / Admin@123
4. **Create Users** → Navigate to "Admin Panel" in sidebar
5. **Add New User:**
   - Enter user's full name
   - Enter user's email
   - Generate or create a temporary password
   - Click "Create User Account"
6. **Share Credentials** → Copy and provide the credentials to the user

### For Users:

1. **Receive Credentials** → Get email and password from admin
2. **Access the App** → Go to http://localhost:3001
3. **Select Login Type** → Click "User Login"
4. **First Login** → Enter provided credentials
5. **Change Password** → System prompts to set new password
6. **Set New Password:**
   - Enter a new password (min 6 characters)
   - Confirm the new password
   - Click "Change Password & Continue"
7. **Access Dashboard** → Start using the ticketing system

---

## 🔐 Security Features

### Password Requirements:
- Minimum 6 characters
- Must be changed on first login for new users
- Stored as bcrypt hashes

### Role-Based Access:
- **Admin:** Full access + user management
- **User:** Standard ticketing features

### Session Management:
- JWT tokens with 7-day expiration
- Automatic logout on token expiry
- Secure password reset flow

---

## 🎨 New Pages Added

### 1. Login Type Selection (`/`)
- Choose between Admin or User login
- Clean, modern interface
- Mobile responsive

### 2. Admin Login (`/admin-login`)
- Dedicated admin authentication
- Security badge indicators
- Back button to selection page

### 3. User Login (`/user-login`)
- Standard user authentication
- Password change flow integration
- Helpful error messages

### 4. Admin Panel (`/admin-panel`)
- Create new user accounts
- View all existing users
- Generate random passwords
- Copy credentials to clipboard
- Real-time user list updates

---

## 📊 Database Schema Changes

### New Columns in `users` table:
```sql
role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user'))
must_change_password BOOLEAN DEFAULT false
last_password_change TIMESTAMP WITH TIME ZONE
```

### Default Admin Account:
```sql
name: 'System Administrator'
email: 'admin@system.local'
password: 'Admin@123' (hashed)
role: 'admin'
```

---

## 🔧 API Endpoints

### Authentication:
- `POST /api/auth/admin-login` - Admin authentication
- `POST /api/auth/user-login` - User authentication  
- `POST /api/auth/change-password` - Change password after first login

### User Management (Admin only):
- `POST /api/auth/create-user` - Create new user account
- `GET /api/auth/debug/users` - List all users

### Legacy (Backward Compatible):
- `POST /api/auth/login` - Generic login
- `POST /api/auth/register` - Self-registration

---

## 🎯 Testing the System

### Test Admin Login:
1. Navigate to http://localhost:3001
2. Click "Admin Login"
3. Enter:
   - Email: admin@system.local
   - Password: Admin@123
4. Should redirect to dashboard
5. Check sidebar for "👑 Admin Panel" link

### Test User Creation:
1. Login as admin
2. Click "Admin Panel" in sidebar
3. Click "Create New User"
4. Fill in user details:
   - Name: Test User
   - Email: test@example.com
   - Click "Generate Random Password"
5. Click "Create User Account"
6. Copy the credentials shown
7. Logout

### Test User Login:
1. Navigate to http://localhost:3001
2. Click "User Login"
3. Enter the credentials from admin
4. Should prompt for password change
5. Set new password and confirm
6. Should redirect to dashboard

---

## 🎨 Styling

All new pages follow your existing design system:
- Green theme maintained
- Consistent button styles
- Responsive layouts
- Professional appearance
- Smooth animations and transitions

---

## 🚨 Important Security Notes

### ⚠️ Before Going to Production:

1. **Change Admin Password:**
   ```
   Login as admin → Change default password immediately
   ```

2. **Use Environment Variables:**
   ```
   JWT_SECRET should be a strong, random string
   Store in .env file, never commit to Git
   ```

3. **Enable HTTPS:**
   ```
   All authentication should happen over HTTPS
   Update API URLs to use https://
   ```

4. **Disable Self-Registration:**
   ```
   Remove /register route if not needed
   Admin-only user creation is more secure
   ```

5. **Add Rate Limiting:**
   ```
   Implement rate limiting on login endpoints
   Prevent brute force attacks
   ```

---

## 📝 Files Created/Modified

### New Files:
- `client/src/pages/LoginTypeSelection.tsx`
- `client/src/pages/AdminLogin.tsx`
- `client/src/pages/UserLogin.tsx`
- `client/src/pages/AdminPanel.tsx`
- `client/src/styles/LoginTypeSelection.css`
- `client/src/styles/AdminLogin.css`
- `client/src/styles/UserLogin.css`
- `client/src/styles/AdminPanel.css`
- `migrations/06_add_admin_and_user_roles.sql`

### Modified Files:
- `client/src/App.tsx` - Added new routes
- `client/src/components/Sidebar.tsx` - Added Admin Panel link
- `server/routes/auth.js` - Added admin/user login and user creation

---

## 🐛 Troubleshooting

### Issue: Admin Panel not showing in sidebar
**Solution:** Make sure you're logged in as admin role

### Issue: Cannot create users
**Solution:** Check that migration ran successfully and admin account exists

### Issue: Password change not working
**Solution:** Verify `must_change_password` column exists in database

### Issue: Login redirects to wrong page
**Solution:** Clear browser localStorage and try again

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check server logs for backend errors
3. Verify database migrations ran successfully
4. Ensure all environment variables are set

---

## ✅ Checklist

Before considering setup complete:

- [ ] Database migration executed successfully
- [ ] Admin login works with default credentials
- [ ] Admin can access Admin Panel
- [ ] Admin can create new users
- [ ] New users receive credentials
- [ ] Users can login and are prompted to change password
- [ ] Password change flow works correctly
- [ ] Users can access dashboard after password change
- [ ] Admin Panel only visible to admin users
- [ ] All styling matches your green theme

---

## 🎉 You're All Set!

Your ticketing system now has a complete admin and user management system. Admins can create accounts for team members, and users must change their password on first login for security.

**Next Steps:**
1. Login as admin and change the default password
2. Create accounts for your team members
3. Share credentials securely with each team member
4. Monitor user accounts from the Admin Panel

Enjoy your enhanced ticketing system! 🚀