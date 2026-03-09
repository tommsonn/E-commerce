import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const isRead = req.query.isRead;

    const query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    res.json(user.notificationPreferences || {
      email: true,
      push: true,
      orderUpdates: true,
      promotions: true,
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.notificationPreferences = {
      email: req.body.email ?? user.notificationPreferences?.email ?? true,
      push: req.body.push ?? user.notificationPreferences?.push ?? true,
      orderUpdates: req.body.orderUpdates ?? user.notificationPreferences?.orderUpdates ?? true,
      promotions: req.body.promotions ?? user.notificationPreferences?.promotions ?? true,
    };
    
    await user.save();
    
    res.json(user.notificationPreferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to create notification (used by other controllers)
export const createNotification = async (
  userId,
  type,
  title,
  message,
  data = {},
  actionLink = null,
  actionText = null,
  image = null
) => {
  try {
    // Check if user exists and wants notifications
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User ${userId} not found, cannot create notification`);
      return null;
    }

    // Check user preferences
    const prefs = user.notificationPreferences || {};
    
    // Create the notification regardless (in-app)
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      actionLink,
      actionText,
      image,
      isRead: false,
    });

    console.log(`✅ Notification created for user ${userId}: ${title}`);

    // Here you could also send email based on preferences
    // if (prefs.email) { sendEmail... }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};