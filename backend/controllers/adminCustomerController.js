import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Get all customers with pagination and filters
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    const isAdmin = req.query.isAdmin;
    const dateRange = req.query.dateRange;

    // Build query
    let query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by admin status
    if (isAdmin !== undefined) {
      query.isAdmin = isAdmin === 'true';
    }

    // Filter by active status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Execute query with pagination
    const customers = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    // Get total count
    const total = await User.countDocuments(query);

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ userId: customer._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        return {
          ...customer.toObject(),
          totalOrders,
          totalSpent
        };
      })
    );

    res.json({
      customers: customersWithStats,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get customer statistics
// @route   GET /api/admin/customer-stats
// @access  Private/Admin
export const getCustomerStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Get all stats in parallel for better performance
    const [
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      customersWithOrders,
      totalOrders,
      totalRevenue
    ] = await Promise.all([
      // Total customers
      User.countDocuments(),
      
      // Active customers (logged in within last 30 days)
      User.countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      
      // New customers this month
      User.countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      }),
      
      // Customers with at least one order
      Order.distinct('userId').then(ids => ids.length),
      
      // Total orders
      Order.countDocuments(),
      
      // Total revenue
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0)
    ]);

    res.json({
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      customersWithOrders,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle admin status for a user
// @route   PUT /api/admin/customers/:id/toggle-admin
// @access  Private/Admin
export const toggleAdminStatus = async (req, res) => {
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
      message: `User ${user.isAdmin ? 'is now an admin' : 'is no longer an admin'}`,
      isAdmin: user.isAdmin 
    });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single customer details
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
export const getCustomerById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's orders
    const orders = await Order.find({ userId: user._id }).sort('-createdAt');
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const lastOrder = orders[0] || null;

    res.json({
      ...user.toObject(),
      totalOrders,
      totalSpent,
      lastOrder
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};