import Contact from '../models/Contact.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    console.log('✅ New contact message received:', contact._id);

    // Find all admin users to notify
    const adminUsers = await User.find({ isAdmin: true });
    
    // Create notification for each admin
    for (const admin of adminUsers) {
      try {
        await createNotification(
          admin._id,
          'contact',
          'New Contact Message',
          `${name} sent a message: ${subject}`,
          { 
            contactId: contact._id, 
            name, 
            email, 
            subject,
            preview: message.substring(0, 100)
          },
          '/admin?tab=contacts',
          'View Message',
          null
        );
        console.log(`✅ Notification created for admin: ${admin.email}`);
      } catch (notifError) {
        console.error('Error creating notification for admin:', notifError);
      }
    }

    res.status(201).json({ 
      success: true,
      message: 'Contact form submitted successfully',
      contact 
    });
  } catch (error) {
    console.error('❌ Error submitting contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isRead = req.query.isRead;
    const isReplied = req.query.isReplied;
    const search = req.query.search;

    let query = {};

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (isReplied !== undefined) {
      query.isReplied = isReplied === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    console.log(`📬 Found ${contacts.length} contact messages`);

    res.json({
      messages: contacts,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark contact as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
export const markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    contact.isRead = true;
    await contact.save();

    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reply to contact message
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
export const replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    contact.reply = reply;
    contact.isReplied = true;
    contact.repliedAt = new Date();
    contact.repliedBy = req.user._id;
    await contact.save();

    console.log(`✅ Reply sent to ${contact.email}`);

    // Find the customer user by email
    const customer = await User.findOne({ email: contact.email });
    
    if (customer) {
      // Create notification for the customer - FIXED: Use proper actionLink format with message ID
      await createNotification(
        customer._id,
        'contact',
        'Reply to Your Message',
        `Admin replied to your message: "${contact.subject.substring(0, 50)}${contact.subject.length > 50 ? '...' : ''}"`,
        { 
          contactId: contact._id, 
          messageId: contact._id, // Add both for compatibility
          subject: contact.subject,
          reply: reply.substring(0, 100)
        },
        `/my-messages/${contact._id}`, // Include the message ID in the link
        'View Reply',
        null
      );
      console.log(`✅ Notification created for customer: ${customer.email} with link: /my-messages/${contact._id}`);
    } else {
      console.log(`⚠️ User not found with email: ${contact.email}`);
    }

    res.json(contact);
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await contact.deleteOne();
    console.log(`🗑️ Deleted contact message: ${contact._id}`);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get contact stats
// @route   GET /api/contact/stats
// @access  Private/Admin
export const getContactStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, unread, replied, todayCount] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ isRead: false }),
      Contact.countDocuments({ isReplied: true }),
      Contact.countDocuments({ createdAt: { $gte: today } }),
    ]);

    console.log('📊 Contact stats:', { total, unread, replied, today: todayCount });

    res.json({
      total,
      unread,
      replied,
      today: todayCount,
    });
  } catch (error) {
    console.error('Error getting contact stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user's messages
// @route   GET /api/contact/my-messages
// @access  Private
export const getMyMessages = async (req, res) => {
  try {
    const messages = await Contact.find({ email: req.user.email })
      .sort('-createdAt');
    
    console.log(`📬 Found ${messages.length} messages for user: ${req.user.email}`);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};