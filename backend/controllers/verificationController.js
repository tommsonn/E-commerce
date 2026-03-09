import User from '../models/User.js';
import crypto from 'crypto';
import { sendEmail, emailTemplates } from '../utils/email.js';
import { createNotification } from './notificationController.js';

// @desc    Send verification email
// @route   POST /api/verification/send
// @access  Public
export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email
    await sendEmail({
      email: user.email,
      ...emailTemplates.verifyEmail(user.fullName, verificationToken),
    });

    // Create notification
    await createNotification(
      user._id,
      'security',
      'Verify Your Email',
      'We\'ve sent a verification link to your email. Please check your inbox.',
      { email: user.email },
      '/verify-email',
      'Verify Email',
      null
    );

    res.json({ 
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('❌ Send verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification email',
      error: error.message 
    });
  }
};

// @desc    Verify email with token
// @route   GET /api/verification/verify/:token
// @access  Public
export const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required' 
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired verification link' 
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        ...emailTemplates.welcome(user.fullName),
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    // Create notification
    await createNotification(
      user._id,
      'system',
      'Welcome to EthioShop! 🎉',
      'Your email has been verified. You can now log in and start shopping!',
      { email: user.email },
      '/login',
      'Login Now',
      null
    );

    res.json({ 
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during verification',
      error: error.message 
    });
  }
};

// @desc    Check verification status
// @route   POST /api/verification/status
// @access  Public
export const checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email }).select('email fullName isEmailVerified');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      isVerified: user.isEmailVerified,
      email: user.email,
      fullName: user.fullName
    });
  } catch (error) {
    console.error('❌ Check verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/verification/resend
// @access  Public
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    // Check if last verification email was sent recently (prevent spam)
    if (user.lastVerificationSentAt) {
      const timeSinceLastEmail = Date.now() - new Date(user.lastVerificationSentAt).getTime();
      const minTimeBetweenEmails = 2 * 60 * 1000; // 2 minutes

      if (timeSinceLastEmail < minTimeBetweenEmails) {
        const waitTime = Math.ceil((minTimeBetweenEmails - timeSinceLastEmail) / 1000);
        return res.status(429).json({ 
          success: false, 
          message: `Please wait ${waitTime} seconds before requesting another email`,
          waitTime
        });
      }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    user.lastVerificationSentAt = new Date();
    await user.save();

    // Send verification email
    await sendEmail({
      email: user.email,
      ...emailTemplates.verifyEmail(user.fullName, verificationToken),
    });

    res.json({ 
      success: true,
      message: 'Verification email resent successfully'
    });
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resend verification email',
      error: error.message 
    });
  }
};

// @desc    Get verification token info (for debugging)
// @route   GET /api/verification/token-info/:token
// @access  Public (temporary for testing)
export const getTokenInfo = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token
    }).select('email fullName emailVerificationExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Token not found' 
      });
    }

    const isValid = user.emailVerificationExpires > Date.now();
    const expiresIn = Math.max(0, Math.floor((user.emailVerificationExpires - Date.now()) / 1000));

    res.json({
      success: true,
      token: {
        email: user.email,
        fullName: user.fullName,
        expiresAt: user.emailVerificationExpires,
        isValid,
        expiresInSeconds: expiresIn,
        expiresInHours: (expiresIn / 3600).toFixed(1)
      }
    });
  } catch (error) {
    console.error('❌ Token info error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};