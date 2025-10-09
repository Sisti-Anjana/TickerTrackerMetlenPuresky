═══════════════════════════════════════════════════════════════════
🚀 COMPLETE LOGIN SYSTEM SETUP & TESTING GUIDE
═══════════════════════════════════════════════════════════════════

✅ SETUP COMPLETED - YOUR SYSTEM IS NOW READY!

═══════════════════════════════════════════════════════════════════
📋 ADMIN LOGIN CREDENTIALS
═══════════════════════════════════════════════════════════════════

Email:    admin@system.local
Password: Admin@123

⚠️  IMPORTANT: Change this password after first login!

═══════════════════════════════════════════════════════════════════
🚀 HOW TO START THE APPLICATION
═══════════════════════════════════════════════════════════════════

OPTION 1 - Using Two Terminals (Recommended):
──────────────────────────────────────────────

Terminal 1 (Backend Server):
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"
   npm start

Terminal 2 (Frontend Client):
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud\client"
   npm start

OPTION 2 - Using Concurrently (Single Terminal):
──────────────────────────────────────────────

   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"
   npm run dev

═══════════════════════════════════════════════════════════════════
🌐 ACCESS THE APPLICATION
═══════════════════════════════════════════════════════════════════

1. Open your browser and go to: http://localhost:3000

2. You should see the LOGIN TYPE SELECTION screen:
   ┌─────────────────────────────────────────┐
   │  Welcome to AGS Ticketing System        │
   │  Please select your login type          │
   │                                         │
   │  ┌─────────────┐  ┌─────────────┐     │
   │  │ 👑 Admin    │  │ 👤 User      │     │
   │  │   Login     │  │   Login      │     │
   │  └─────────────┘  └─────────────┘     │
   └─────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
✅ TESTING THE LOGIN SYSTEM
═══════════════════════════════════════════════════════════════════

TEST 1: ADMIN LOGIN FLOW
─────────────────────────

1. ✅ On home page (http://localhost:3000)
   → You see two cards: "Admin Login" and "User Login"

2. ✅ Click "Continue as Admin"
   → URL changes to: http://localhost:3000/admin-login

3. ✅ Enter credentials:
   Email:    admin@system.local
   Password: Admin@123

4. ✅ Click "Login as Admin"
   → You should be redirected to: http://localhost:3000/dashboard

5. ✅ Check the sidebar (left side):
   → You should see "👑 Admin Panel" option (only visible to admins)

6. ✅ Click "👑 Admin Panel"
   → You can create new users here

TEST 2: USER LOGIN FLOW
─────────────────────────

1. ✅ Click "Logout" in sidebar

2. ✅ On home page, click "Continue as User"
   → URL changes to: http://localhost:3000/user-login

3. ✅ Try logging in with any existing user:
   (Check the list from the setup script - users like:
    - jaswanthi9999@gmail.com
    - anjanasisti2@gmail.com
    - etc.)

4. ✅ After successful login:
   → Dashboard should load
   → "👑 Admin Panel" should NOT be visible in sidebar

═══════════════════════════════════════════════════════════════════
🔧 TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════

PROBLEM: "Invalid email or password" for admin login
────────────────────────────────────────────────────
SOLUTION:
   Run the fix script again:
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\TAnj - claud"
   node fix-admin-login.js

PROBLEM: Backend server not starting
────────────────────────────────────────────────────
CHECK:
   ✓ Port 5001 is not already in use
   ✓ .env file exists in root directory
   ✓ Supabase credentials are correct

SOLUTION:
   Stop any running node processes:
   Get-Process node | Stop-Process -Force
   Then restart the server

PROBLEM: Frontend not connecting to backend
────────────────────────────────────────────────────
CHECK:
   ✓ Backend is running on port 5001
   ✓ Check browser console for errors (F12)
   ✓ Verify API URL in client/.env:
     REACT_APP_API_URL=http://localhost:5001/api

PROBLEM: "Access denied. Admin privileges required"
────────────────────────────────────────────────────
SOLUTION:
   You're trying to login as admin but the user doesn't have admin role.
   Make sure you're using: admin@system.local

PROBLEM: Redirected to login page after successful login
────────────────────────────────────────────────────
SOLUTION:
   1. Clear browser cache and cookies
   2. Clear localStorage:
      - Open DevTools (F12)
      - Go to Application → Local Storage
      - Delete all entries
   3. Try logging in again

═══════════════════════════════════════════════════════════════════
📊 SYSTEM STATUS CHECK
═══════════════════════════════════════════════════════════════════

Run these commands to verify everything is working:

1. Check if admin user exists:
   node fix-admin-login.js

2. Check all users in database:
   You can see the list in the output above

3. Test backend API:
   curl http://localhost:5001/api/auth/test

   Expected response:
   {
     "message": "Auth routes are working!",
     "timestamp": "2025-10-09T..."
   }

═══════════════════════════════════════════════════════════════════
🎯 ROUTING STRUCTURE
═══════════════════════════════════════════════════════════════════

PUBLIC ROUTES (No login required):
───────────────────────────────────

/                    → Login Type Selection (Home)
/admin-login         → Admin Login Page
/user-login          → User Login Page
/forgot-password     → Password Recovery
/reset-password      → Password Reset

PROTECTED ROUTES (Login required):
───────────────────────────────────

/dashboard           → Main Dashboard
/create-ticket       → Create New Ticket
/tickets/:id         → View Ticket Details
/tickets/:id/edit    → Edit Ticket
/analytics           → Reports & Analytics
/team-performance    → Team Performance Stats
/source              → Source Management
/change-password     → Change Your Password

ADMIN ONLY ROUTES:
───────────────────────────────────

/admin-panel         → Admin Panel (Create Users, Manage System)

═══════════════════════════════════════════════════════════════════
🔐 SECURITY FEATURES
═══════════════════════════════════════════════════════════════════

✅ Separate login flows for Admin and User
✅ Role-based access control (RBAC)
✅ JWT token authentication (7-day expiry)
✅ Password hashing with bcrypt
✅ Protected routes with authentication check
✅ Admin panel only visible to admin users
✅ Auto-redirect to dashboard if already logged in
✅ Token stored securely in localStorage
✅ API Authorization headers with Bearer token

═══════════════════════════════════════════════════════════════════
📚 NEXT STEPS
═══════════════════════════════════════════════════════════════════

1. ✅ Login as admin using the credentials above
2. ✅ Test creating a new user account via Admin Panel
3. ✅ Test logging in with the newly created user
4. ✅ Change the admin password (recommended)
5. ✅ Create user accounts for your team members
6. ✅ Test all features (create tickets, reports, etc.)

═══════════════════════════════════════════════════════════════════
💡 TIPS
═══════════════════════════════════════════════════════════════════

• Keep the backend server running in one terminal
• Keep the frontend server running in another terminal
• Use browser DevTools (F12) to check for errors
• Check server logs for any backend errors
• The admin password should be changed immediately
• Regular users cannot access the Admin Panel
• All users see the same Dashboard but with different permissions

═══════════════════════════════════════════════════════════════════

Need more help? Check these files:
• ADMIN_CREDENTIALS.txt - Admin login details
• ADMIN_USER_SYSTEM_GUIDE.md - Complete admin system guide
• START_HERE.md - General getting started guide

═══════════════════════════════════════════════════════════════════
