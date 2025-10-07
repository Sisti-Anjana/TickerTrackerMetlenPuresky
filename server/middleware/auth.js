const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE START ===');
    
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('✅ Token found, verifying...');
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    
    console.log('✅ Token verified, finding user:', decoded.userId);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    // Ensure user ID is properly formatted
    req.user = {
      id: parseInt(user.id),
      name: user.name,
      email: user.email
    };
    
    console.log('✅ Auth successful, user:', req.user.id);
    next();
  } catch (error) {
    console.error('=== AUTH ERROR ===');
    console.error('Error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;