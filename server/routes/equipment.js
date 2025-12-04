const express = require('express');
const router = express.Router();

// Simple admin verification (duplicated from admin.js for isolation)
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
    console.error('verifyAdmin error (equipment):', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/equipment - list all active equipment
router.get('/', async (_req, res) => {
  try {
    const { supabase } = require('../../config/supabase');
    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching equipment:', error);
      return res.status(500).json({ message: 'Failed to load equipment options' });
    }

    res.json({ equipment: data || [] });
  } catch (err) {
    console.error('Unexpected error fetching equipment:', err);
    res.status(500).json({ message: 'Failed to load equipment options' });
  }
});

// POST /api/equipment - create new equipment (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Equipment name is required' });
    }

    const cleanName = name.trim();
    const { supabase } = require('../../config/supabase');

    const { data, error } = await supabase
      .from('equipment')
      .insert([{ name: cleanName }])
      .select('id, name, is_active')
      .single();

    // Handle duplicate names gracefully
    if (error && error.code === '23505') {
      return res.status(400).json({ message: 'This equipment name already exists' });
    }

    if (error || !data) {
      console.error('Error creating equipment:', error);
      return res.status(500).json({ message: 'Failed to create equipment' });
    }

    res.status(201).json({ equipment: data });
  } catch (err) {
    console.error('Unexpected error creating equipment:', err);
    res.status(500).json({ message: 'Failed to create equipment' });
  }
});

// DELETE /api/equipment/:id - soft delete (set is_active = false) (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid equipment ID' });
    }

    const { supabase } = require('../../config/supabase');
    const { error } = await supabase
      .from('equipment')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting equipment:', error);
      return res.status(500).json({ message: 'Failed to delete equipment' });
    }

    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    console.error('Unexpected error deleting equipment:', err);
    res.status(500).json({ message: 'Failed to delete equipment' });
  }
});

module.exports = router;


