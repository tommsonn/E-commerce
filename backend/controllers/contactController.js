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

    console.log('📝 Creating new contact message:', { name, email, subject });

    const contact = await Contact.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      isRead: false,
      isReplied: false
    });

    console.log('✅ New contact message saved with ID:', contact._id);

    // Find all admin users to notify
    const adminUsers = await User.find({ isAdmin: true });
    console.log(`👥 Found ${adminUsers.length} admin users to notify`);
    
    // Create notification for each admin
    if (adminUsers.length > 0) {
      for (const admin of adminUsers) {
        try {
          console.log(`📨 Creating notification for admin: ${admin.email}`);
          
          const notification = await createNotification(
            admin._id,
            'contact',
            'New Contact Message',
            `${name} sent a message: ${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}`,
            { 
              contactId: contact._id, 
              messageId: contact._id,
              name, 
              email, 
              subject,
              preview: message.substring(0, 100)
            },
            '/admin?tab=contacts',
            'View Message',
            null
          );
          
          if (notification) {
            console.log(`✅ Notification created for admin: ${admin.email} with ID: ${notification._id}`);
          } else {
            console.log(`❌ Failed to create notification for admin: ${admin.email}`);
          }
        } catch (notifError) {
          console.error('❌ Error creating notification for admin:', notifError);
        }
      }
    } else {
      console.log('⚠️ No admin users found to notify');
    }

    // If user is logged in, create notification for the user too
    if (req.user) {
      try {
        console.log(`📨 Creating notification for user: ${req.user.email}`);
        
        const userNotification = await createNotification(
          req.user._id,
          'contact',
          'Message Sent',
          `Your message "${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}" has been received. We'll respond soon.`,
          { 
            contactId: contact._id,
            messageId: contact._id,
            subject
          },
          `/my-messages/${contact._id}`,
          'View Message',
          null
        );
        
        if (userNotification) {
          console.log(`✅ Notification created for user: ${req.user.email}`);
        }
      } catch (notifError) {
        console.error('❌ Error creating notification for user:', notifError);
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
    const limit = parseInt(req.query.limit) || 20;
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
      .populate('repliedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    console.log(`📬 Found ${contacts.length} contact messages for admin`);

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
// @access  Private (Admin or message owner)
export const getContactById = async (req, res) => {
  try {
    console.log(`🔍 Fetching message with ID: ${req.params.id} for user: ${req.user.email}`);
    
    const contact = await Contact.findById(req.params.id)
      .populate('repliedBy', 'fullName email');
    
    if (!contact) {
      console.log(`❌ Message not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is admin OR the message owner
    const isAdmin = req.user.isAdmin === true;
    const isOwner = contact.email === req.user.email;
    
    console.log(`🔐 Access check - isAdmin: ${isAdmin}, isOwner: ${isOwner}`);
    
    if (isAdmin || isOwner) {
      console.log(`✅ Access granted to message ${req.params.id}`);
      return res.json(contact);
    }

    console.log(`❌ Access denied to message ${req.params.id} for user ${req.user.email}`);
    return res.status(403).json({ message: 'Not authorized to view this message' });
    
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark contact as read
// @route   PUT /api/contact/:id/read
// @access  Private (Admin or message owner)
export const markAsRead = async (req, res) => {
  try {
    console.log(`📝 Marking message as read: ${req.params.id} for user: ${req.user.email}`);
    
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is admin OR the message owner
    const isAdmin = req.user.isAdmin === true;
    const isOwner = contact.email === req.user.email;
    
    console.log(`🔐 Access check - isAdmin: ${isAdmin}, isOwner: ${isOwner}`);
    
    if (isAdmin || isOwner) {
      contact.isRead = true;
      await contact.save();
      console.log(`✅ Message ${req.params.id} marked as read by ${req.user.email}`);
      return res.json(contact);
    }

    console.log(`❌ Access denied to mark message ${req.params.id} as read for user ${req.user.email}`);
    return res.status(403).json({ message: 'Not authorized to modify this message' });
    
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reply to contact message
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
export const replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    
    console.log(`📝 Admin replying to message: ${req.params.id}`);
    console.log(`👤 Admin: ${req.user.email}`);
    
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

    console.log(`✅ Reply saved for message ${contact._id}`);
    console.log(`📧 Customer email: ${contact.email}`);

    // Find the customer user by email
    const customer = await User.findOne({ email: contact.email });
    
    if (customer) {
      console.log(`👤 Customer found: ${customer.email} (ID: ${customer._id})`);
      
      // Create notification for the customer
      try {
        const notification = await createNotification(
          customer._id,
          'contact',
          'Reply to Your Message',
          `Admin replied to your message: "${contact.subject.substring(0, 50)}${contact.subject.length > 50 ? '...' : ''}"`,
          { 
            contactId: contact._id, 
            messageId: contact._id,
            subject: contact.subject,
            reply: reply.substring(0, 100)
          },
          `/my-messages/${contact._id}`,
          'View Reply',
          null
        );
        
        if (notification) {
          console.log(`✅ Notification created for customer: ${customer.email} with ID: ${notification._id}`);
          console.log(`🔗 Action link: /my-messages/${contact._id}`);
        } else {
          console.log(`❌ Failed to create notification for customer: ${customer.email}`);
        }
      } catch (notifError) {
        console.error('❌ Error creating notification for customer:', notifError);
      }
    } else {
      console.log(`⚠️ No user account found with email: ${contact.email}`);
      console.log('The customer may not have an account or may need to sign up first');
    }

    res.json(contact);
  } catch (error) {
    console.error('❌ Error sending reply:', error);
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

// @desc    Get current user's messages (for customers) OR all messages (for admins)
// @route   GET /api/contact/my-messages
// @access  Private
export const getMyMessages = async (req, res) => {
  try {
    console.log('🔍 Getting messages for user:', req.user.email);
    console.log('👤 User is admin:', req.user.isAdmin);
    
    let messages;
    
    if (req.user.isAdmin) {
      // Admins can see all messages
      console.log('👑 Admin user - fetching ALL messages');
      messages = await Contact.find({})
        .populate('repliedBy', 'fullName email')
        .sort({ createdAt: -1 });
    } else {
      // Regular users only see their own messages
      console.log('👤 Regular user - fetching messages for:', req.user.email);
      messages = await Contact.find({ email: req.user.email })
        .populate('repliedBy', 'fullName email')
        .sort({ createdAt: -1 });
    }
    
    console.log(`📬 Found ${messages.length} messages total`);
    
    res.json({ 
      success: true,
      messages 
    });
  } catch (error) {
    console.error('❌ Error fetching user messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
