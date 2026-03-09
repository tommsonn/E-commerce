import express from 'express';
import { body } from 'express-validator';
import { 
  registerUser, 
  loginUser, 
  getMe,
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  updateProfile,
  getUserStats,
  getAllUsers
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============== PUBLIC ROUTES ==============

// Register new user
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
  ],
  registerUser
);

// Login user
router.post('/login', loginUser);

// Verify email
router.get('/verify-email/:token', verifyEmail);

// Resend verification email
router.post('/resend-verification', resendVerificationEmail);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password/:token', resetPassword);

// ============== PROTECTED ROUTES (require login) ==============

// Get current user
router.get('/me', protect, getMe);

// Send verification email
router.post('/send-verification', protect, sendVerificationEmail);

// Update profile
router.put('/profile', protect, updateProfile);

// ============== ADMIN ROUTES (require admin) ==============

// Get user statistics
router.get('/stats', protect, admin, getUserStats);

// Get all users
router.get('/users', protect, admin, getAllUsers);

export default router;