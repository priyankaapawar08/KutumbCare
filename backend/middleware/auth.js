const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token'
      });
    }

    try {
      // Verify token with fallback secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-12345');
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      req.userId = decoded.id;
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: `User role ${user.role} is not authorized to access this route`
        });
      }
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error in authorization'
      });
    }
  };
};