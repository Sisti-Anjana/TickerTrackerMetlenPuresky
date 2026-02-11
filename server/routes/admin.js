const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

    const { supabase } = require('../../config/supabase');
    // Verify admin role from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', decoded.userId)
      .single();

    // Fallback: If role column is missing (it shouldn't be now), treat admin@system.local as admin
    if (user && user.email === 'admin@system.local' && !user.role) {
      user.role = 'admin';
    }

    if (error || !user || user.role !== 'admin') {
      console.log('❌ verifyAdmin: Access denied or user not found');
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    console.log(`✅ verifyAdmin: User is admin (ID: ${user.id}). Proceeding...`);
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('❌ verifyAdmin EXCEPTION:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// CREATE USER (Admin only)
router.post('/create-user', verifyAdmin, async (req, res) => {
  try {
    console.log('--- CREATE USER ATTEMPT ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { name, email, password } = req.body;

    // Validation
    if (!name) {
      console.log('❌ Create user: Missing name');
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email) {
      console.log('❌ Create user: Missing email');
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
      console.log('❌ Create user: Missing password');
      return res.status(400).json({ message: 'Password is required' });
    }
    if (password.length < 6) {
      console.log('❌ Create user: Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Create user: Invalid email format');
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const { supabase } = require('../../config/supabase');

    // Check if user already exists
    console.log('Checking if user exists:', email.toLowerCase().trim());
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      console.log('❌ Create user: Email already exists');
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check user error:', checkError);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with must_change_password flag
    console.log('Inserting new user into database...');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: req.body.role || 'user',
        must_change_password: true
      }])
      .select('id, name, email, role')
      .single();

    if (insertError) {
      console.error('❌ Create user: INSERT error:', insertError);
      return res.status(400).json({
        message: 'Failed to create user account',
        details: insertError.message,
        code: insertError.code
      });
    }

    if (!newUser) {
      console.log('❌ Create user: No user returned after insert');
      return res.status(500).json({ message: 'Failed to create user account - no data returned' });
    }

    console.log(`✅ Create user SUCCESS: ${newUser.id}`);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      credentials: {
        email: email.toLowerCase().trim(),
        password: password
      }
    });
  } catch (error) {
    console.error('❌ Create user route EXCEPTION:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET ALL USERS (Admin only)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { supabase } = require('../../config/supabase');
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, must_change_password')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }

    res.json({ users: users || [] });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// GET SINGLE USER (Admin only)
router.get('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { supabase } = require('../../config/supabase');
    console.log(`🔍 GET /users/:id - Fetching user ID: ${req.params.id} (type: ${typeof req.params.id})`);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, must_change_password')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error(`❌ GET /users/:id - Supabase Error:`, error);
      return res.status(error.code === 'PGRST116' ? 404 : 500).json({
        message: 'Database error fetching user',
        error: error.message
      });
    }

    if (!user) {
      console.log(`❌ GET /users/:id - User NOT FOUND: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ Get user SUCCESS for ID: ${req.params.id}`);
    res.json({ user });
  } catch (error) {
    console.error(`❌ Get user route EXCEPTION for ID: ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message,
      stack: error.stack // Temporarily expose for debugging
    });
  }
});

// UPDATE USER (Admin only)
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const userIdParam = req.params.id;
    if (!userIdParam) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const { name, email, password } = req.body;

    const { supabase } = require('../../config/supabase');

    // Check if user exists (role column excluded to prevent 404s if missing in DB)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userIdParam)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Map fields for compatibility
    user.current_name = user.name;
    user.current_email = user.email;
    user.current_role = user.role || 'user'; // role might be undefined, that's fine


    // Build update object and track changes
    const updateData = {};
    let changes = 0;

    if (name && name.trim() && name.trim() !== user.current_name) {
      updateData.name = name.trim();
      changes++;
    }

    if (req.body.role && req.body.role !== user.current_role) {
      updateData.role = req.body.role;
      changes++;
    }

    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.current_email) {
        // Check if email already exists for another user
        const { data: existingEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', normalizedEmail)
          .neq('id', userIdParam)
          .maybeSingle();

        if (existingEmail) {
          return res.status(400).json({ message: 'Another user already uses this email address' });
        }

        updateData.email = normalizedEmail;
        changes++;
      }
    }

    // If password is provided, hash it
    if (password && password.length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
      updateData.must_change_password = true; // Require password change if password is updated
      changes++;
    }

    if (changes === 0) {
      return res.json({ message: 'No changes detected. User details are already up to date.' });
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userIdParam);

    if (updateError) {
      console.error('Update user error:', updateError);
      if (updateError.code === '23505') {
        return res.status(400).json({ message: 'Another user already uses this email address' });
      }
      return res.status(500).json({ message: 'Failed to update user', error: updateError.message });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// DELETE USER (Admin only)
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    const { supabase } = require('../../config/supabase');

    // Check if user exists and is not an admin
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// RESET USER PASSWORD (Admin only)
router.post('/users/:id/reset-password', verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const { supabase } = require('../../config/supabase');

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and set must_change_password flag
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        must_change_password: true
      })
      .eq('id', userId)
      .eq('role', 'user');

    if (updateError) {
      return res.status(500).json({ message: 'Failed to reset password' });
    }

    res.json({
      message: 'Password reset successfully',
      newPassword: newPassword
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// ==================== CLIENT TYPE MANAGEMENT ====================

// GET ALL CLIENT TYPES (Admin only)
router.get('/client-types', verifyAdmin, async (req, res) => {
  try {
    const { supabase } = require('../../config/supabase');

    // Get all client types with their sites
    const { data: clientTypes, error: clientError } = await supabase
      .from('client_types')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientError) {
      return res.status(500).json({ message: 'Failed to fetch client types' });
    }

    // Get all sites for each client type
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (sitesError) {
      return res.status(500).json({ message: 'Failed to fetch sites' });
    }

    // Combine client types with their sites
    // Ensure consistent structure even if status column is missing
    const clientTypesWithSites = (clientTypes || []).map(client => ({
      id: client.id,
      name: client.name,
      status: client.status || 'active', // Default if column doesn't exist
      created_at: client.created_at,
      updated_at: client.updated_at,
      sites: (sites || []).filter(site => site.client_type_id === client.id).map(site => ({
        id: site.id,
        name: site.name,
        location: site.location || null,
        client_type_id: site.client_type_id,
        status: site.status || 'active', // Default if column doesn't exist
        created_at: site.created_at,
        updated_at: site.updated_at
      }))
    }));

    console.log(`✅ Admin: Returning ${clientTypesWithSites.length} client type(s) with sites`);
    res.json({ client_types: clientTypesWithSites });
  } catch (error) {
    console.error('Get client types error:', error);
    res.status(500).json({ message: 'Failed to fetch client types', error: error.message });
  }
});

// CREATE CLIENT TYPE (Admin only)
router.post('/client-types', verifyAdmin, async (req, res) => {
  try {
    console.log('=== CREATE CLIENT TYPE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    const { name, description, status } = req.body;

    if (!name || name.trim() === '') {
      console.error('Validation failed: name is empty');
      return res.status(400).json({ message: 'Client type name is required' });
    }

    const { supabase } = require('../../config/supabase');

    // First, verify the table exists by trying to query it
    const { error: tableCheckError } = await supabase
      .from('client_types')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      console.error('Table check error:', tableCheckError);
      if (tableCheckError.code === '42P01' || tableCheckError.message?.includes('does not exist')) {
        return res.status(500).json({
          message: 'Database table "client_types" does not exist. Please run the migration script first.',
          error: tableCheckError.message,
          code: tableCheckError.code
        });
      }
      return res.status(500).json({
        message: 'Database error',
        error: tableCheckError.message,
        code: tableCheckError.code
      });
    }

    // Check if client type already exists
    const { data: existing, error: checkError } = await supabase
      .from('client_types')
      .select('id')
      .eq('name', name.trim())
      .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

    if (checkError) {
      console.error('Error checking existing client type:', checkError);
      // If it's a "not found" error, that's fine - continue
      if (checkError.code !== 'PGRST116') {
        return res.status(500).json({
          message: 'Error checking for existing client type',
          error: checkError.message,
          code: checkError.code
        });
      }
    }

    if (existing) {
      return res.status(400).json({
        message: `Client type "${name.trim()}" already exists. Please use a different name or edit the existing client type.`,
        existingId: existing.id
      });
    }

    // Create client type
    // Build insert object - handle status column gracefully
    const insertData = {
      name: name.trim(),
      description: description || null
    };

    // Only include status if provided (let DB default handle it if column doesn't exist)
    // If status column doesn't exist, this will fail, but we'll catch it below
    if (status) {
      insertData.status = status;
    } else {
      insertData.status = 'active'; // Default value
    }

    console.log('Inserting client type:', insertData);
    const { data: newClientType, error: insertError } = await supabase
      .from('client_types')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error details:', insertError.details);

      // Check if error is about missing status column or any column issue
      // Check if error is about missing status or description column
      const errorMsg = insertError.message?.toLowerCase() || '';
      const isMissingCol =
        (insertError.code === 'PGRST103' && (errorMsg.includes('description') || errorMsg.includes('status'))) ||
        (insertError.code === 'PGRST204' && (errorMsg.includes('description') || errorMsg.includes('status'))) ||
        (errorMsg.includes('does not exist') && (errorMsg.includes('description') || errorMsg.includes('status')));

      if (isMissingCol) {
        // Try again with minimum columns- just insert the name
        console.log('⚠️ Column mismatch. Retrying insert with name only...');
        const { data: retryClientType, error: retryError } = await supabase
          .from('client_types')
          .insert([{ name: name.trim() }])
          .select()
          .single();

        if (retryError) {
          console.error('Retry also failed:', retryError);
          return res.status(500).json({
            message: 'Failed to create client type. Please check: 1) Table exists, 2) Run ADD_STATUS_COLUMN.sql if status column is missing, 3) Check database connection.',
            error: retryError.message,
            code: retryError.code,
            details: retryError.details,
            originalError: insertError.message
          });
        }

        // Success without status - add default status in response
        const clientTypeWithStatus = {
          ...retryClientType,
          status: 'active' // Add default status for response
        };

        console.log('✅ Client type created successfully (without status column):', clientTypeWithStatus);
        return res.status(201).json({
          message: 'Client type created successfully',
          client_type: clientTypeWithStatus,
          note: 'Status column not found in database - please run ADD_STATUS_COLUMN.sql to add it for full functionality'
        });
      }

      return res.status(500).json({
        message: 'Failed to create client type',
        error: insertError.message,
        code: insertError.code,
        details: insertError.details
      });
    }

    if (!newClientType) {
      console.error('No client type returned after insert');
      return res.status(500).json({ message: 'Failed to create client type - no data returned' });
    }

    console.log('Client type created successfully:', newClientType);
    res.status(201).json({
      message: 'Client type created successfully',
      client_type: newClientType
    });
  } catch (error) {
    console.error('Create client type error:', error);
    res.status(500).json({ message: 'Failed to create client type', error: error.message });
  }
});

// UPDATE CLIENT TYPE (Admin only)
router.put('/client-types/:id', verifyAdmin, async (req, res) => {
  try {
    const clientId = req.params.id;
    const { name, description, status } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Client type name is required' });
    }

    const { supabase } = require('../../config/supabase');

    // Check if client type exists
    const { data: existing } = await supabase
      .from('client_types')
      .select('id')
      .eq('id', clientId)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Client type not found' });
    }

    // Check if name is already taken by another client type
    const { data: nameTaken } = await supabase
      .from('client_types')
      .select('id')
      .eq('name', name.trim())
      .neq('id', clientId)
      .single();

    if (nameTaken) {
      return res.status(400).json({ message: 'Client type with this name already exists' });
    }

    // Update client type
    const updateData = {
      name: name.trim(),
      description: description || null,
      status: status || 'active'
    };

    const { data: updated, error: updateError } = await supabase
      .from('client_types')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Update client type error:', updateError);

      // Retry without description/status if missing
      const errorMsg = updateError.message?.toLowerCase() || '';
      if (updateError.code === 'PGRST204' || errorMsg.includes('column') || errorMsg.includes('does not exist')) {
        console.log('Retrying update with name only...');
        const { data: retryUpdated, error: retryError } = await supabase
          .from('client_types')
          .update({ name: name.trim() })
          .eq('id', clientId)
          .select()
          .single();

        if (!retryError && retryUpdated) {
          return res.json({
            message: 'Client type updated successfully (partial)',
            client_type: retryUpdated
          });
        }
      }
      return res.status(500).json({ message: 'Failed to update client type', error: updateError.message });
    }

    res.json({
      message: 'Client type updated successfully',
      client_type: updated
    });
  } catch (error) {
    console.error('Update client type error:', error);
    res.status(500).json({ message: 'Failed to update client type', error: error.message });
  }
});

// CLEAR ALL CLIENT TYPES AND SITES (Admin only) - MUST BE BEFORE /:id ROUTE
router.delete('/client-types/all', verifyAdmin, async (req, res) => {
  try {
    const { supabase } = require('../../config/supabase');

    // Get all client type IDs first
    const { data: allClientTypes } = await supabase
      .from('client_types')
      .select('id');

    // Delete all sites first (due to foreign key constraint)
    const { error: sitesError } = await supabase
      .from('sites')
      .delete()
      .gte('id', 0); // Delete all (gte id 0 means all records)

    if (sitesError) {
      return res.status(500).json({ message: 'Failed to delete sites', error: sitesError.message });
    }

    // Delete all client types
    const { error: clientTypesError } = await supabase
      .from('client_types')
      .delete()
      .gte('id', 0); // Delete all

    if (clientTypesError) {
      return res.status(500).json({ message: 'Failed to delete client types', error: clientTypesError.message });
    }

    res.json({ message: 'All client types and sites deleted successfully' });
  } catch (error) {
    console.error('Clear all data error:', error);
    res.status(500).json({ message: 'Failed to clear all data', error: error.message });
  }
});

// DELETE CLIENT TYPE (Admin only)
router.delete('/client-types/:id', verifyAdmin, async (req, res) => {
  try {
    const clientId = req.params.id;

    const { supabase } = require('../../config/supabase');

    // Check if client type exists
    const { data: existing } = await supabase
      .from('client_types')
      .select('id')
      .eq('id', clientId)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Client type not found' });
    }

    // Delete all sites associated with this client type
    await supabase
      .from('sites')
      .delete()
      .eq('client_type_id', clientId);

    // Delete client type
    const { error: deleteError } = await supabase
      .from('client_types')
      .delete()
      .eq('id', clientId);

    if (deleteError) {
      return res.status(500).json({ message: 'Failed to delete client type' });
    }

    res.json({ message: 'Client type deleted successfully' });
  } catch (error) {
    console.error('Delete client type error:', error);
    res.status(500).json({ message: 'Failed to delete client type', error: error.message });
  }
});

// ==================== SITE MANAGEMENT ====================

// GET ALL SITES (Admin only)
router.get('/sites', verifyAdmin, async (req, res) => {
  try {
    const { supabase } = require('../../config/supabase');
    const { data: sites, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch sites' });
    }

    res.json({ sites: sites || [] });
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ message: 'Failed to fetch sites', error: error.message });
  }
});

// CREATE SITE (Admin only)
router.post('/sites', verifyAdmin, async (req, res) => {
  try {
    const { name, location, description, status, client_type_id } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Site name is required' });
    }

    if (!client_type_id) {
      return res.status(400).json({ message: 'Client type is required' });
    }

    const { supabase } = require('../../config/supabase');

    // Check if client type exists
    const { data: clientType } = await supabase
      .from('client_types')
      .select('id')
      .eq('id', client_type_id)
      .single();

    if (!clientType) {
      return res.status(404).json({ message: 'Client type not found' });
    }

    // Create site
    console.log('Creating site with data:', { name: name.trim(), location, status, client_type_id });
    const insertData = {
      name: name.trim(),
      location: location || null,
      description: description || null,
      client_type_id: client_type_id
    };

    // Only include status if column exists (handle gracefully)
    if (status) {
      insertData.status = status;
    } else {
      insertData.status = 'active'; // Default
    }

    const { data: newSite, error: insertError } = await supabase
      .from('sites')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error message:', insertError.message);
      console.error('Error details:', insertError.details);

      const errorMsg = insertError.message?.toLowerCase() || '';
      const isMissingCol =
        (insertError.code === 'PGRST103' && (errorMsg.includes('description') || errorMsg.includes('status'))) ||
        (insertError.code === 'PGRST204' && (errorMsg.includes('description') || errorMsg.includes('status'))) ||
        (errorMsg.includes('does not exist') && (errorMsg.includes('description') || errorMsg.includes('status')));

      if (isMissingCol) {
        console.log('Retrying site insert with minimum columns...');
        const { data: retrySite, error: retryError } = await supabase
          .from('sites')
          .insert([{
            name: name.trim(),
            location: location || null,
            client_type_id: client_type_id
          }])
          .select()
          .single();

        if (retryError) {
          return res.status(500).json({
            message: 'Failed to create site (retry failed)',
            error: retryError.message
          });
        }

        return res.status(201).json({
          message: 'Site created successfully (partial)',
          site: retrySite
        });
      }

      return res.status(500).json({
        message: 'Failed to create site',
        error: insertError.message
      });
    }

    res.status(201).json({
      message: 'Site created successfully',
      site: newSite
    });
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({ message: 'Failed to create site', error: error.message });
  }
});

// BULK CREATE SITES (Admin only)
router.post('/sites/bulk', verifyAdmin, async (req, res) => {
  try {
    const { sites, client_type_id } = req.body;

    if (!sites || !Array.isArray(sites) || sites.length === 0) {
      return res.status(400).json({ message: 'No sites provided' });
    }

    if (!client_type_id) {
      return res.status(400).json({ message: 'Client type is required' });
    }

    const { supabase } = require('../../config/supabase');

    // Prepare data for bulk insert
    const insertData = sites.map(name => ({
      name: name.trim(),
      client_type_id: client_type_id,
      status: 'active',
      description: name.includes(' - ') ? name.split(' - ')[1] : null // Optional: support "Name - Description" in bulk
    }));

    console.log(`Bulk inserting ${insertData.length} sites for client type ${client_type_id}`);

    const { data: newSites, error: insertError } = await supabase
      .from('sites')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('Bulk insert error:', insertError);

      // Check if error is related to missing column (description or status)
      const errorMsg = insertError.message?.toLowerCase() || '';
      const isMissingCol =
        (insertError.code === 'PGRST103' && (errorMsg.includes('description') || errorMsg.includes('status'))) ||
        (insertError.code === 'PGRST204' && (errorMsg.includes('description') || errorMsg.includes('status'))) ||
        (errorMsg.includes('does not exist') && (errorMsg.includes('description') || errorMsg.includes('status')));

      if (isMissingCol) {
        console.log('Retrying bulk insert without optional columns...');
        const retryData = sites.map(name => {
          const base = {
            name: name.trim(),
            client_type_id: client_type_id
          };
          // Only add columns if they weren't the cause of error (or just strip both for maximum safety)
          return base;
        });

        const { data: retrySites, error: retryError } = await supabase
          .from('sites')
          .insert(retryData)
          .select();

        if (retryError) {
          console.error('Retry insert failed:', retryError);
          return res.status(500).json({
            message: 'Failed to create sites (retry failed)',
            error: retryError.message
          });
        }

        return res.status(201).json({
          message: `${retrySites.length} sites created successfully (without description/status)`,
          sites: retrySites
        });
      }

      return res.status(500).json({
        message: 'Failed to create sites',
        error: insertError.message,
        details: insertError.details
      });
    }

    res.status(201).json({
      message: `${newSites.length} sites created successfully`,
      sites: newSites
    });
  } catch (error) {
    console.error('Bulk create sites error:', error);
    res.status(500).json({ message: 'Failed to create sites', error: error.message });
  }
});


// UPDATE SITE (Admin only)
router.put('/sites/:id', verifyAdmin, async (req, res) => {
  try {
    const siteId = req.params.id;
    const { name, location, description, status, client_type_id } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Site name is required' });
    }

    if (!client_type_id) {
      return res.status(400).json({ message: 'Client type is required' });
    }

    const { supabase } = require('../../config/supabase');

    // Check if site exists
    const { data: existing } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Check if client type exists
    const { data: clientType } = await supabase
      .from('client_types')
      .select('id')
      .eq('id', client_type_id)
      .single();

    if (!clientType) {
      return res.status(404).json({ message: 'Client type not found' });
    }

    // Update site
    const updateData = {
      name: name.trim(),
      location: location || null,
      description: description || null,
      status: status || 'active',
      client_type_id: client_type_id
    };

    const { data: updated, error: updateError } = await supabase
      .from('sites')
      .update(updateData)
      .eq('id', siteId)
      .select()
      .single();

    if (updateError) {
      console.error('Update site error:', updateError);
      const errorMsg = updateError.message?.toLowerCase() || '';
      if (updateError.code === 'PGRST204' || errorMsg.includes('column') || errorMsg.includes('does not exist')) {
        console.log('Retrying site update with minimum columns...');
        const { data: retryUpdated, error: retryError } = await supabase
          .from('sites')
          .update({
            name: name.trim(),
            location: location || null,
            client_type_id: client_type_id
          })
          .eq('id', siteId)
          .select()
          .single();

        if (!retryError && retryUpdated) {
          return res.json({
            message: 'Site updated successfully (partial)',
            site: retryUpdated
          });
        }
      }
      return res.status(500).json({ message: 'Failed to update site', error: updateError.message });
    }

    res.json({
      message: 'Site updated successfully',
      site: updated
    });
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({ message: 'Failed to update site', error: error.message });
  }
});

// DELETE SITE (Admin only)
router.delete('/sites/:id', verifyAdmin, async (req, res) => {
  try {
    const siteId = req.params.id;

    const { supabase } = require('../../config/supabase');

    // Check if site exists
    const { data: existing } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Delete site
    const { error: deleteError } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId);

    if (deleteError) {
      return res.status(500).json({ message: 'Failed to delete site' });
    }

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({ message: 'Failed to delete site', error: error.message });
  }
});

module.exports = router;