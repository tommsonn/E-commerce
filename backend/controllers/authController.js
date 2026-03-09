import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { sendEmail, emailTemplates } from '../utils/email.js';
import { createNotification } from './notificationController.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, fullName } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user with all fields including lastLogin
    const user = await User.create({
      email,
      password,
      fullName,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      isEmailVerified: false,
      isActive: true,
      lastLogin: null,
      notificationPreferences: {
        email: true,
        push: true,
        orderUpdates: true,
        promotions: true,
      },
    });

    if (user) {
      // Send verification email
      try {
        await sendEmail({
          email: user.email,
          ...emailTemplates.verifyEmail(user.fullName, verificationToken),
        });
        console.log(`✅ Verification email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Continue even if email fails
      }

      res.status(201).json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified,
        phone: user.phone,
        address: user.address,
        notificationPreferences: user.notificationPreferences,
        message: 'Registration successful! Please check your email to verify your account.',
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      // CHECK IF EMAIL IS VERIFIED
      if (!user.isEmailVerified) {
        return res.status(403).json({ 
          message: 'Please verify your email before logging in',
          needsVerification: true,
          email: user.email,
          isEmailVerified: false
        });
      }

      // Update last login with timestamp and IP
      user.lastLogin = new Date();
      user.lastLoginIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      await user.save();

      console.log(`✅ User ${user.email} logged in at ${user.lastLogin}`);

      res.json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified,
        phone: user.phone,
        address: user.address,
        notificationPreferences: user.notificationPreferences,
        lastLogin: user.lastLogin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
export const sendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate verification token
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
      {},
      '/verify-email',
      'Verify Email',
      null
    );

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Check if token exists but is expired
      const expiredUser = await User.findOne({
        emailVerificationToken: token
      });
      
      if (expiredUser) {
        return res.status(400).json({ 
          message: 'Verification link has expired. Please request a new one.' 
        });
      }

      // Check if user is already verified
      const verifiedUser = await User.findOne({
        emailVerificationToken: token,
        isEmailVerified: true
      });

      if (verifiedUser) {
        return res.json({ 
          message: 'Email already verified',
          token: generateToken(verifiedUser._id),
          user: {
            _id: verifiedUser._id,
            email: verifiedUser.email,
            fullName: verifiedUser.fullName,
            isAdmin: verifiedUser.isAdmin,
            isEmailVerified: true,
          }
        });
      }

      return res.status(400).json({ message: 'Invalid or expired token' });
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
      'Welcome to TomShop! 🎉',
      'Your email has been verified. Start exploring our products now!',
      {},
      '/shop',
      'Start Shopping',
      null
    );

    // Generate token for auto-login after verification
    const authToken = generateToken(user._id);

    res.json({ 
      message: 'Email verified successfully',
      token: authToken,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        isEmailVerified: true,
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resend verification email for existing unverified user
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
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

    console.log(`✅ Verification email resent to ${user.email}`);

    res.json({ 
      success: true,
      message: 'Verification email sent successfully' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    await sendEmail({
      email: user.email,
      ...emailTemplates.resetPassword(user.fullName, resetToken),
    });

    // Create notification
    await createNotification(
      user._id,
      'security',
      'Password Reset Requested',
      'We\'ve sent a password reset link to your email.',
      {},
      '/reset-password',
      'Reset Password',
      null
    );

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Create notification
    await createNotification(
      user._id,
      'security',
      'Password Changed',
      'Your password has been successfully changed.',
      {},
      '/login',
      'Login Now',
      null
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update basic info
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      
      // Update address
      if (req.body.address) {
        user.address = {
          street: req.body.address.street || user.address?.street,
          city: req.body.address.city || user.address?.city,
          region: req.body.address.region || user.address?.region,
        };
      }

      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      // Update notification preferences
      if (req.body.notificationPreferences) {
        user.notificationPreferences = {
          ...user.notificationPreferences,
          ...req.body.notificationPreferences,
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        address: updatedUser.address,
        isAdmin: updatedUser.isAdmin,
        isEmailVerified: updatedUser.isEmailVerified,
        notificationPreferences: updatedUser.notificationPreferences,
        lastLogin: updatedUser.lastLogin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user statistics (for admin)
// @route   GET /api/auth/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const activeToday = await User.countDocuments({
      lastLogin: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const activeThisWeek = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const activeThisMonth = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const verified = await User.countDocuments({ isEmailVerified: true });
    const unverified = await User.countDocuments({ isEmailVerified: false });

    res.json({
      total,
      activeToday,
      activeThisWeek,
      activeThisMonth,
      verified,
      unverified
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};