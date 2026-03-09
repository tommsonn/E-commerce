import express from 'express';
import {
  sendVerificationEmail,
  verifyEmailToken,
  checkVerificationStatus,
  resendVerificationEmail,
  getTokenInfo
} from '../controllers/verificationController.js';

const router = express.Router();

// ============== PUBLIC VERIFICATION ROUTES ==============

/**
 * @route   POST /api/verification/send
 * @desc    Send verification email to user
 * @access  Public
 * @body    { email: string }
 */
router.post('/send', sendVerificationEmail);

/**
 * @route   GET /api/verification/verify/:token
 * @desc    Verify email with token
 * @access  Public
 * @params  token: string
 */
router.get('/verify/:token', verifyEmailToken);

/**
 * @route   POST /api/verification/status
 * @desc    Check if user's email is verified
 * @access  Public
 * @body    { email: string }
 */
router.post('/status', checkVerificationStatus);

/**
 * @route   POST /api/verification/resend
 * @desc    Resend verification email (with rate limiting)
 * @access  Public
 * @body    { email: string }
 */
router.post('/resend', resendVerificationEmail);

/**
 * @route   GET /api/verification/token-info/:token
 * @desc    Get information about a verification token (for debugging)
 * @access  Public (temporary - remove in production)
 * @params  token: string
 */
router.get('/token-info/:token', getTokenInfo);

export default router;