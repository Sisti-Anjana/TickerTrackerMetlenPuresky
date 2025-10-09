# 🔧 FIX: ERR_CONNECTION_REFUSED - Port Issue

## ❌ THE PROBLEM:

Your browser console shows:
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
http://localhost:5000/api/auth/admin-login
```

This means the frontend is trying to connect to port **5000**, but your backend runs on port **5001**.

---

## ✅ SOLUTION:

### OPTION 1: Clear Browser Cache (RECOMMENDED)

**This is the fastest fix:**

1. **Press:** `Ctrl + Shift + Delete` (or Cmd + Shift + Delete on Mac)

2. **Select:**
   - ✅ Cached images and files
   - ✅ Cookies and other site data

3. **Time range:** "All time"

4. **Click:** "Clear data"

5. **Close browser completely**

6. **Reopen and go to:** http://localhost:3001

7. **Login again**

---

### OPTION 2: Hard Refresh

1. **Go to:** http://localhost:3001

2. **Press:** `Ctrl + Shift + R` (or Cmd + Shift + R on Mac)
   - This forces the browser to reload without cache

3. **Try logging in again**

---

### OPTION 3: Use Incognito/Private Mode

1. **Open Incognito/Private window:**
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

2. **Go to:** http://localhost:3001

3. **Login** - should work!

---

### OPTION 4: Restart Development Server

If the above doesn't work:

1. **Stop frontend server** (press Ctrl+C in the terminal running `npm start`)

2. **Clear npm cache:**
   ```bash
   cd client
   npm cache clean --force
   ```

3. **Delete build folder:**
   ```bash
   rm -rf build
   # On Windows: rmdir /s /q build
   ```

4. **Restart frontend:**
   ```bash
   npm start
   ```

5. **Go to:** http://localhost:3001

---

## 🎯 WHY THIS HAPPENS:

When we updated the API URLs from port 5000 to 5001, your browser cached the old JavaScript files. The cached files still have the old port number (5000).

**Solution:** Clear the cache so the browser downloads the new files with port 5001.

---

## ✅ TO VERIFY IT'S FIXED:

After clearing cache:

1. **Open browser console** (F12)
2. **Go to Network tab**
3. **Try logging in**
4. **Check the requests** - they should go to:
   ```
   http://localhost:5001/api/auth/admin-login  ✅
   ```
   NOT:
   ```
   http://localhost:5000/api/auth/admin-login  ❌
   ```

---

## 🚀 QUICK FIX (TRY THIS FIRST):

1. **Hard refresh:** `Ctrl + Shift + R`
2. **Try login**
3. **If it fails:** Clear cache completely
4. **Try again**

---

## 📝 AFTER FIXING:

Once it works, you should be able to:
- ✅ Login as admin
- ✅ Access Admin Panel
- ✅ Create users
- ✅ Change passwords

---

**TL;DR: Press `Ctrl + Shift + R` to hard refresh the page!** 🔄