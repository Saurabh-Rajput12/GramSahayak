// Authentication and authorization middlewares
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and attach user to request object
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gram_sahayak_super_secret_lab_key_2026');

      // Fetch user from database excluding password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found or account removed' });
      }

      // Check if user account is blocked by Panchayat
      if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked by the Panchayat. Please contact the panchayat office.' });
      }

      // Attach user to request object for downstream controllers
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware to restrict access to Panchayat administrators only
const onlyPanchayat = (req, res, next) => {
  if (req.user && req.user.role === 'panchayat') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Panchayat role required.' });
  }
};

module.exports = {
  protect,
  onlyPanchayat
};
