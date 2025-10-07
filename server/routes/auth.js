const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

// REGISTRATION
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST START ===');
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

    const { data: existingUser, error: checkError } = await supabase
      .from('users').select('id, email').eq('email', email).single();

    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists', field: 'email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword }])
      .select('id, name, email').single();

    if (insertError || !newUser) {
      return res.status(500).json({ message: 'Failed to create user account' });
    }

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token: token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration', error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const { supabase } = require('../../config/supabase');
    const { data: user, error } = await supabase
      .from('users').select('id, name, email, password')
      .eq('email', email.toLowerCase().trim()).single();

    if (error || !user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret-key', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
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
      .from('users').select('id, name, email').eq('id', decoded.userId).single();

    if (error || !user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
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
    
    // Send email
    const { sendPasswordResetEmail } = require('../utils/email');
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);
    
    if (emailResult.success) {
      console.log('✅ Password reset email sent to:', user.email);
      res.json({ message: 'Password reset link has been sent to your email' });
    } else {
      console.error('❌ Failed to send email:', emailResult.error);
      // Still return success to prevent email enumeration, but log error
      res.json({ 
        message: 'If that email exists, a password reset link has been sent',
        // Remove these in production - only for testing
        resetToken: resetToken,
        resetUrl: resetUrl,
        emailError: emailResult.error
      });
    }
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
      .from('users').select('id, name, email, created_at').order('created_at', { ascending: false });
    res.json({ message: `Found ${users?.length || 0} users`, users: users || [], count: users?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!', timestamp: new Date().toISOString() });
});

module.exports = router;
