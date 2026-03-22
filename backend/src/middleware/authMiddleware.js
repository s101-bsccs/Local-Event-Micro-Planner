const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.currentUser = null;
    return next();
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'granthmitra-dev-secret'
    );

    req.currentUser = await User.findById(payload.userId);
  } catch (error) {
    console.error('Token verification error:', error.message);
    req.currentUser = null;
  }

  next();
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'granthmitra-dev-secret'
    );

    req.currentUser = await User.findById(payload.userId);
    
    if (!req.currentUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = {
  optionalAuth,
  requireAuth
};
