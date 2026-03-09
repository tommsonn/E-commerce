import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import adminCustomerRoutes from './adminCustomerRoutes.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

// All routes are protected and require admin
router.use(protect, admin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// ============== PAYMENT MANAGEMENT ROUTES ==============

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments with optional filtering
 * @access  Private/Admin
 */
router.get('/payments', async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (method && method !== 'all') query.paymentMethod = method;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const payments = await Payment.find(query)
      .populate('assignedAdmin', 'fullName email')
      .populate('verifiedBy', 'fullName email')
      .populate('orderId', 'orderNumber totalAmount customerName')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      success: true,
      payments,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/payments/:id
 * @desc    Get single payment details
 * @access  Private/Admin
 */
router.get('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('assignedAdmin', 'fullName email')
      .populate('verifiedBy', 'fullName email')
      .populate('orderId');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/payments/:id/assign
 * @desc    Manually assign payment to an admin
 * @access  Private/Admin
 */
router.put('/payments/:id/assign', async (req, res) => {
  try {
    const { adminId } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    payment.assignedAdmin = adminId;
    await payment.save();
    
    res.json({ 
      success: true, 
      message: 'Payment assigned successfully',
      payment 
    });
  } catch (error) {
    console.error('Error assigning payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/payments/:id/verify
 * @desc    Verify bank transfer payment
 * @access  Private/Admin
 */
router.post('/payments/:id/verify', async (req, res) => {
  try {
    const { transactionId, notes } = req.body;
    const adminId = req.user._id;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    // Update payment
    payment.status = 'completed';
    payment.transactionId = transactionId || payment.transactionId;
    payment.verifiedBy = adminId;
    payment.verifiedAt = new Date();
    payment.completedAt = new Date();
    payment.metadata = { ...payment.metadata, verificationNotes: notes };
    await payment.save();
    
    // Update order
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: 'paid',
      paymentReference: transactionId || payment.transactionId
    });
    
    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      payment 
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/payments/stats/summary
 * @desc    Get payment statistics summary
 * @access  Private/Admin
 */
router.get('/payments/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalPayments,
      pendingPayments,
      completedPayments,
      todayPayments,
      totalAmount,
      todayAmount
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: { $in: ['pending', 'processing'] } }),
      Payment.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ createdAt: { $gte: today } }),
      Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { createdAt: { $gte: today }, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    
    res.json({
      success: true,
      stats: {
        totalPayments,
        pendingPayments,
        completedPayments,
        todayPayments,
        totalAmount: totalAmount[0]?.total || 0,
        todayAmount: todayAmount[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/payments/stats/methods
 * @desc    Get payment statistics by method
 * @access  Private/Admin
 */
router.get('/payments/stats/methods', async (req, res) => {
  try {
    const methods = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { 
          _id: '$paymentMethod', 
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        } 
      }
    ]);
    
    res.json({ success: true, methods });
  } catch (error) {
    console.error('Error fetching method stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/payments/stats/admin-workload
 * @desc    Get workload statistics for admins
 * @access  Private/Admin
 */
router.get('/payments/stats/admin-workload', async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true }).select('_id fullName email');
    
    const workload = await Promise.all(
      admins.map(async (admin) => {
        const pending = await Payment.countDocuments({
          assignedAdmin: admin._id,
          status: { $in: ['pending', 'processing'] }
        });
        
        const completed = await Payment.countDocuments({
          verifiedBy: admin._id,
          status: 'completed'
        });
        
        const totalAmount = await Payment.aggregate([
          { $match: { verifiedBy: admin._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        return {
          admin,
          pending,
          completed,
          total: pending + completed,
          totalAmount: totalAmount[0]?.total || 0
        };
      })
    );
    
    res.json({ success: true, workload });
  } catch (error) {
    console.error('Error fetching admin workload:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/payments/assign-auto
 * @desc    Auto-assign pending payments to least busy admin
 * @access  Private/Admin
 */
router.post('/payments/assign-auto', async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ 
      status: { $in: ['pending', 'processing'] },
      assignedAdmin: null 
    });
    
    const admins = await User.find({ isAdmin: true }).select('_id');
    
    if (admins.length === 0) {
      return res.json({ success: false, message: 'No admins available' });
    }
    
    // Calculate admin workloads
    const adminWorkload = await Promise.all(
      admins.map(async (admin) => {
        const count = await Payment.countDocuments({
          assignedAdmin: admin._id,
          status: { $in: ['pending', 'processing'] }
        });
        return { adminId: admin._id, count };
      })
    );
    
    // Sort by workload (least busy first)
    adminWorkload.sort((a, b) => a.count - b.count);
    
    // Assign payments round-robin
    let assigned = 0;
    for (let i = 0; i < pendingPayments.length; i++) {
      const adminIndex = i % admins.length;
      const adminId = adminWorkload[adminIndex].adminId;
      
      pendingPayments[i].assignedAdmin = adminId;
      await pendingPayments[i].save();
      assigned++;
    }
    
    res.json({ 
      success: true, 
      message: `Assigned ${assigned} payments to admins`,
      assigned 
    });
  } catch (error) {
    console.error('Error auto-assigning payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mount customer routes
router.use('/', adminCustomerRoutes);

export default router;