import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no authorization header',
        status: 401
      });
    }

    if (!req.headers.authorization.startsWith('Bearer')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - invalid authorization format. Use Bearer token',
        status: 401
      });
    }

    token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token provided',
        status: 401
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - invalid token',
        status: 401,
        details: jwtError.message
      });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - user not found',
        status: 401
      });
    }

    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      status: 500
    });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
      status: 403
    });
  }
};