const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

// Helper: compare password and upgrade legacy plaintext passwords transparently
async function verifyAndUpgradePassword(supabase, userRecord, incomingPassword) {
  const stored = userRecord.password || '';
  const looksHashed = stored.startsWith('$2');

  if (looksHashed) {
    console.log(`🔍 Verifying hashed password for user ${userRecord.id}`);
    console.log(`   Stored hash prefix: ${stored.substring(0, 10)}...`);
    const isMatch = await bcrypt.compare(incomingPassword, stored);
    console.log(`   Bcrypt match result: ${isMatch}`);
    return { ok: isMatch };
  }

  // Legacy plaintext password support (dev/legacy data): match and upgrade to bcrypt
  if (stored && stored === incomingPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(incomingPassword, salt);
      await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', userRecord.id);
    } catch (_) {
      // ignore upgrade failure; login can still proceed if matched
    }
    return { ok: true, upgraded: true };
  }

  return { ok: false };
}

// ADMIN LOGIN
router.post('/admin-login', async (req, res) => {
  try {
    console.log('✅ /api/auth/admin-login route hit');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Request body:', { email: req.body?.email ? 'present' : 'missing' });
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    let supabase;
    try {
      const supabaseConfig = require('../../config/supabase');
      supabase = supabaseConfig.supabase;
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
    } catch (configError) {
      console.error('Failed to load Supabase config:', configError);
      return res.status(500).json({
        message: 'Server configuration error',
        error: configError.message
      });
    }

    console.log('--- ADMIN LOGIN ATTEMPT ---');
    console.log('Email:', email);
    console.log('Password length:', password ? password.length : 0);

    // ... (rest of validation)

    // Authenticate user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, role')
      .eq('email', email.toLowerCase().trim())
      .single();

    // Fallback for admin if role is missing (temporary fix)
    if (user && user.email === 'admin@system.local' && !user.role) {
      user.role = 'admin';
    }

    if (error) {
      console.error('Supabase lookup error:', error);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User found:', { id: user.id, role: user.role, hasPassword: !!user.password });

    // Check if user is admin
    if (user.role !== 'admin') {
      console.error('❌ User is not admin. Role:', user.role);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Add timeout protection for password verification
    const verifyPromise = verifyAndUpgradePassword(supabase, user, password);
    const verifyTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Password verification timeout')), 10000)
    );

    let verify;
    try {
      verify = await Promise.race([verifyPromise, verifyTimeoutPromise]);
    } catch (timeoutError) {
      console.error('Password verification timeout:', timeoutError);
      return res.status(500).json({
        message: 'Server is taking too long to respond. Please try again.',
        error: 'Verification timeout'
      });
    }

    if (!verify.ok) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token with error handling
    let token;
    try {
      token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      );
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({
        message: 'Failed to create session. Please try again.',
        error: 'Token generation failed'
      });
    }

    res.json({
      message: 'Admin login successful',
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Login failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// UNIFIED LOGIN (admin + regular users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    let supabase;
    try {
      const supabaseConfig = require('../../config/supabase');
      supabase = supabaseConfig.supabase;
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
    } catch (configError) {
      console.error('Failed to load Supabase config:', configError);
      return res.status(500).json({
        message: 'Server configuration error. Please try again later.',
        error: configError.message
      });
    }

    // Add timeout protection for database query
    const queryPromise = supabase
      .from('users')
      .select('id, name, email, password, role, must_change_password')
      .eq('email', email.toLowerCase().trim())
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 10000)
    );

    let user, error;
    try {
      const result = await Promise.race([queryPromise, timeoutPromise]);
      user = result.data;
      error = result.error;
    } catch (timeoutError) {
      console.error('Database query timeout:', timeoutError);
      return res.status(500).json({
        message: 'Server is taking too long to respond. Please try again.',
        error: 'Database timeout'
      });
    }

    if (error) {
      console.error('Supabase query error (login):', error);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user) {
      console.log(`❌ Login failed: User not found for email '${email}'`);
      return res.status(400).json({ message: `Debug: User not found for email '${email}'` });
    }

    console.log(`✅ Login: User found (ID: ${user.id}). Verifying password...`);

    // Password verification with timeout
    const verifyPromise = verifyAndUpgradePassword(supabase, user, password);
    const verifyTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Password verification timeout')), 10000)
    );

    let verify;
    try {
      verify = await Promise.race([verifyPromise, verifyTimeoutPromise]);
    } catch (timeoutError) {
      console.error('Password verification timeout (login):', timeoutError);
      return res.status(500).json({
        message: 'Server is taking too long to respond. Please try again.',
        error: 'Verification timeout'
      });
    }

    if (!verify.ok) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    let token;
    try {
      token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      );
    } catch (tokenError) {
      console.error('Token generation error (login):', tokenError);
      return res.status(500).json({
        message: 'Failed to create session. Please try again.',
        error: 'Token generation failed'
      });
    }

    // If must_change_password is true, signal frontend to show change-password flow
    if (user.must_change_password) {
      return res.json({
        mustChangePassword: true,
        userId: user.id
      });
    }

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Unified login error:', error);
    return res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

// USER LOGIN (legacy - kept for backward compatibility)
router.post('/user-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    let supabase;
    try {
      const supabaseConfig = require('../../config/supabase');
      supabase = supabaseConfig.supabase;
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
    } catch (configError) {
      console.error('Failed to load Supabase config:', configError);
      return res.status(500).json({
        message: 'Server configuration error. Please try again later.',
        error: configError.message
      });
    }

    // Add timeout protection for database query
    const queryPromise = supabase
      .from('users')
      .select('id, name, email, password, role, must_change_password')
      .eq('email', email.toLowerCase().trim())
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 10000)
    );

    let user, error;
    try {
      const result = await Promise.race([queryPromise, timeoutPromise]);
      user = result.data;
      error = result.error;
    } catch (timeoutError) {
      console.error('Database query timeout:', timeoutError);
      return res.status(500).json({
        message: 'Server is taking too long to respond. Please try again.',
        error: 'Database timeout'
      });
    }

    if (error) {
      console.error('Supabase query error:', error);
      // Don't reveal if user exists or not for security
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user is regular user (not admin)
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Please use admin login for admin accounts' });
    }

    // Add timeout protection for password verification
    const verifyPromise = verifyAndUpgradePassword(supabase, user, password);
    const verifyTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Password verification timeout')), 10000)
    );

    let verify;
    try {
      verify = await Promise.race([verifyPromise, verifyTimeoutPromise]);
    } catch (timeoutError) {
      console.error('Password verification timeout:', timeoutError);
      return res.status(500).json({
        message: 'Server is taking too long to respond. Please try again.',
        error: 'Verification timeout'
      });
    }

    if (!verify.ok) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if password change is required
    if (user.must_change_password) {
      return res.json({
        mustChangePassword: true,
        userId: user.id,
        message: 'Password change required'
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('User login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Login failed. Please try again.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// CHANGE PASSWORD
router.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const { supabase } = require('../../config/supabase');

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, password, role')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        must_change_password: false
      })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to update password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Password changed successfully',
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});
// Note: CREATE USER is now handled in admin.js for better security with verifyAdmin middleware


// REGISTRATION (Keep for backward compatibility)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required', field: 'name' });
    if (!email) return res.status(400).json({ message: 'Email is required', field: 'email' });
    if (!password) return res.status(400).json({ message: 'Password is required', field: 'password' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters', field: 'password' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address', field: 'email' });
    }

    const { supabase } = require('../../config/supabase');

    const { data: existingUser } = await supabase
      .from('users').select('id, email').eq('email', email).single();

    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists', field: 'email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user'
      }])
      .select('id, name, email, role').single();

    if (insertError || !newUser) {
      return res.status(500).json({ message: 'Failed to create user account' });
    }

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token: token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration', error: error.message });
  }
});

// LOGIN (Keep for backward compatibility)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('[AUTH] /login missing fields', { hasEmail: !!email, hasPassword: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    let supabase;
    try {
      const supabaseConfig = require('../../config/supabase');
      supabase = supabaseConfig.supabase;
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
    } catch (configError) {
      console.error('Failed to load Supabase config:', configError);
      return res.status(500).json({
        message: 'Server configuration error. Please try again later.',
        error: configError.message
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Add timeout protection for database query
    const queryPromise = supabase
      .from('users')
      .select('id, name, email, password, role')
      .eq('email', normalizedEmail)
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 10000)
    );

    let user, error;
    try {
      const result = await Promise.race([queryPromise, timeoutPromise]);
      user = result.data;
      error = result.error;
    } catch (timeoutError) {
      console.error('Database query timeout:', timeoutError);
      return res.status(500).json({
        message: 'Server is taking too long to respond. Please try again.',
        error: 'Database timeout'
      });
    }

    if (error || !user) {
      console.log('[AUTH] /login user not found or error', { normalizedEmail, error: error?.message });
      // Don't reveal if user exists or not for security
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Add timeout protection for password verification
    const verifyPromise = verifyAndUpgradePassword(supabase, user, String(password));
    const verifyTimeoutPromise2 = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Password verification timeout')), 10000)
    );

    let verify;
    try {
      verify = await Promise.race([verifyPromise, verifyTimeoutPromise2]);
    } catch (timeoutError) {
      console.error('Password verification timeout:', timeoutError);
      return res.status(500).json({
        message: 'Server is taking too long to respond. Please try again.',
        error: 'Verification timeout'
      });
    }

    if (!verify.ok) {
      console.log('[AUTH] /login password mismatch', { normalizedEmail });
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token with error handling
    let token;
    try {
      token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      );
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({
        message: 'Failed to create session. Please try again.',
        error: 'Token generation failed'
      });
    }

    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Login failed. Please try again.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// GET CURRENT USER
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const { supabase } = require('../../config/supabase');
    const { data: user, error } = await supabase
      .from('users').select('id, name, email, role').eq('id', decoded.userId).single();

    if (error || !user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const { supabase } = require('../../config/supabase');
    const { data: user, error } = await supabase
      .from('users').select('id, name, email').eq('email', email.toLowerCase().trim()).single();

    if (error || !user) {
      return res.json({ message: 'If that email exists, a password reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    const { error: updateError } = await supabase
      .from('users')
      .update({ reset_token: resetTokenHash, reset_token_expiry: resetTokenExpiry.toISOString() })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to process request' });
    }

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    res.json({
      message: 'If that email exists, a password reset link has been sent',
      resetToken: resetToken,
      resetUrl: resetUrl
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { supabase } = require('../../config/supabase');

    const { data: user, error } = await supabase
      .from('users').select('id, email, reset_token_expiry')
      .eq('reset_token', resetTokenHash).single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const now = new Date();
    const expiry = new Date(user.reset_token_expiry);
    if (now > expiry) {
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword, reset_token: null, reset_token_expiry: null })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to reset password' });
    }

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// DEBUG ENDPOINTS
router.get('/debug/users', async (req, res) => {
  try {
    const { supabase } = require('../../config/supabase');
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    res.json({
      message: `Found ${users?.length || 0} users`,
      users: users || [],
      count: users?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!', timestamp: new Date().toISOString() });
});

module.exports = router;