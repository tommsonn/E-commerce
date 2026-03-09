import express from 'express';
import { body } from 'express-validator';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

// ============== HELPER FUNCTIONS ==============

// Get user orders
const getUserOrders = async (userId) => {
  return await Order.find({ userId }).sort('-createdAt');
};

// Get user stats
const getUserStats = async (userId) => {
  const orders = await Order.find({ userId });
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lastOrder = orders[0] || null;
  
  return {
    totalOrders,
    totalSpent,
    lastOrder,
  };
};

// ============== PROTECTED ROUTES (require login) ==============

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user stats
    const stats = await getUserStats(user._id);

    res.json({
      success: true,
      user: user.getProfile(),
      stats,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  protect,
  [
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('phone').optional().isMobilePhone('any').withMessage('Please enter a valid phone number'),
  ],
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update basic info
      if (req.body.fullName) user.fullName = req.body.fullName;
      if (req.body.phone) user.phone = req.body.phone;
      
      // Update email (requires re-verification)
      if (req.body.email && req.body.email !== user.email) {
        // Check if email is already taken
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        
        user.email = req.body.email;
        user.isEmailVerified = false; // Require re-verification
        // Generate new verification token
        user.generateVerificationToken();
      }
      
      // Update address
      if (req.body.address) {
        user.address = {
          street: req.body.address.street || user.address?.street || '',
          city: req.body.address.city || user.address?.city || '',
          region: req.body.address.region || user.address?.region || '',
          country: req.body.address.country || user.address?.country || 'Ethiopia',
          zipCode: req.body.address.zipCode || user.address?.zipCode || '',
        };
      }

      // Update password if provided
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        user.password = req.body.password;
      }

      // Update notification preferences
      if (req.body.notificationPreferences) {
        user.notificationPreferences = {
          ...user.notificationPreferences,
          ...req.body.notificationPreferences,
        };
      }

      // Update profile image
      if (req.body.profileImage) {
        user.profileImage = req.body.profileImage;
      }

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: user.getProfile(),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/users/profile
 * @desc    Deactivate user account
 * @access  Private
 */
router.delete('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/users/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check current password
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/users/orders
 * @desc    Get current user's orders
 * @access  Private
 */
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(50);

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/users/orders/:orderId
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/orders/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get current user statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await getUserStats(req.user._id);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/users/upload-profile-image
 * @desc    Upload profile image
 * @access  Private
 */
router.post('/upload-profile-image', protect, async (req, res) => {
  try {
    // This would integrate with your image upload middleware
    // For now, we'll just return a placeholder
    res.json({
      success: true,
      message: 'Profile image upload endpoint - implement with multer',
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============== ADMIN ROUTES (require admin) ==============

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID (admin only)
 * @access  Private/Admin
 */
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = await getUserStats(user._id);

    res.json({
      success: true,
      user: user.getProfile(),
      stats,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id/toggle-admin
 * @desc    Toggle admin status (admin only)
 * @access  Private/Admin
 */
router.put('/:id/toggle-admin', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow removing admin from the last admin
    if (user.isAdmin && user._id.toString() !== req.user._id.toString()) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin' });
      }
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({
      success: true,
      message: `User is ${user.isAdmin ? 'now an admin' : 'no longer an admin'}`,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error('Toggle admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id/toggle-active
 * @desc    Toggle user active status (admin only)
 * @access  Private/Admin
 */
router.put('/:id/toggle-active', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    user.deactivatedAt = user.isActive ? null : new Date();
    await user.save();

    res.json({
      success: true,
      message: `User is ${user.isActive ? 'now active' : 'now inactive'}`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/users/stats/overview
 * @desc    Get user statistics overview (admin only)
 * @access  Private/Admin
 */
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const stats = await User.getStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get user stats overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;