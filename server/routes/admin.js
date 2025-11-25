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
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', decoded.userId)
      .single();

    if (error || !user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// CREATE USER (Admin only)
router.post('/create-user', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const { supabase } = require('../../config/supabase');

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with must_change_password flag
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user',
        must_change_password: true
      }])
      .select('id, name, email, role')
      .single();

    if (insertError || !newUser) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ message: 'Failed to create user account' });
    }

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
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// GET ALL USERS (Admin only)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { supabase } = require('../../config/supabase');
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, last_password_change, must_change_password')
      .eq('role', 'user')
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

// UPDATE USER (Admin only)
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const userIdParam = parseInt(req.params.id, 10);
    if (Number.isNaN(userIdParam)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const { name, email, password } = req.body;

    const { supabase } = require('../../config/supabase');
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, name as current_name, email as current_email')
      .eq('id', userIdParam)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build update object and track changes
    const updateData = {};
    let changes = 0;

    if (name && name.trim() && name.trim() !== user.current_name) {
      updateData.name = name.trim();
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
      const bcrypt = require('bcrypt');
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
    
    const { name, status } = req.body;

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
      name: name.trim()
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
      if (insertError.code === 'PGRST204' || insertError.message?.includes('column') || insertError.message?.includes('status')) {
        // Try again without status column - just insert the name
        console.log('⚠️ Status column may be missing. Retrying insert with name only...');
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
    const { name, status } = req.body;

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
    const { data: updated, error: updateError } = await supabase
      .from('client_types')
      .update({
        name: name.trim(),
        status: status || 'active'
      })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError || !updated) {
      return res.status(500).json({ message: 'Failed to update client type' });
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
    const { name, location, status, client_type_id } = req.body;

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
      location: location ? location.trim() : null,
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
      
      // Check if error is about missing status column
      if (insertError.code === 'PGRST204' && insertError.message?.includes('status')) {
        // Retry without status column
        console.log('Retrying site insert without status column...');
        const { data: retrySite, error: retryError } = await supabase
          .from('sites')
          .insert([{
            name: name.trim(),
            location: location ? location.trim() : null,
            client_type_id: client_type_id
          }])
          .select()
          .single();
          
        if (retryError) {
          console.error('Retry also failed:', retryError);
          // Check what the actual error is
          if (retryError.code === '42P01' || retryError.message?.includes('does not exist')) {
            return res.status(500).json({ 
              message: 'The sites table does not exist. Please run CREATE_CLIENT_SITE_TABLES.sql script first.',
              error: retryError.message,
              code: retryError.code
            });
          } else if (retryError.code === '23503' || retryError.message?.includes('foreign key')) {
            return res.status(500).json({ 
              message: 'Invalid client type ID. The client type may have been deleted.',
              error: retryError.message,
              code: retryError.code
            });
          } else {
            return res.status(500).json({ 
              message: 'Failed to create site. Please check: 1) Run ADD_STATUS_COLUMN.sql if status column is missing, 2) Verify client_type_id is valid, 3) Check database connection.',
              error: retryError.message,
              code: retryError.code,
              details: retryError.details
            });
          }
        }
        
        // Success without status
        const siteWithStatus = {
          ...retrySite,
          status: 'active'
        };
        return res.status(201).json({
          message: 'Site created successfully',
          site: siteWithStatus
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to create site',
        error: insertError.message,
        code: insertError.code,
        details: insertError.details
      });
    }

    if (!newSite) {
      console.error('No site returned after insert');
      return res.status(500).json({ message: 'Failed to create site - no data returned' });
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

// UPDATE SITE (Admin only)
router.put('/sites/:id', verifyAdmin, async (req, res) => {
  try {
    const siteId = req.params.id;
    const { name, location, status, client_type_id } = req.body;

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
    const { data: updated, error: updateError } = await supabase
      .from('sites')
      .update({
        name: name.trim(),
        location: location ? location.trim() : null,
        status: status || 'active',
        client_type_id: client_type_id
      })
      .eq('id', siteId)
      .select()
      .single();

    if (updateError || !updated) {
      return res.status(500).json({ message: 'Failed to update site' });
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