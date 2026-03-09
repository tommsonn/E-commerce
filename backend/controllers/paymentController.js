import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Helper function to assign payment to an admin
const assignToAdmin = async (paymentId) => {
  try {
    const admins = await User.find({ isAdmin: true }).select('_id');
    
    if (admins.length === 0) return null;
    
    const adminWorkload = await Promise.all(
      admins.map(async (admin) => {
        const count = await Payment.countDocuments({
          assignedAdmin: admin._id,
          status: { $in: ['pending', 'processing'] }
        });
        return { adminId: admin._id, count };
      })
    );
    
    adminWorkload.sort((a, b) => a.count - b.count);
    return adminWorkload[0].adminId;
  } catch (error) {
    console.error('Error assigning admin:', error);
    return null;
  }
};

// @desc    Initialize Telebirr payment
// @route   POST /api/payment/telebirr/initiate
// @access  Private
export const initiateTelebirrPayment = async (req, res) => {
  try {
    const { amount, orderId, customerName, customerPhone, customerEmail, subject } = req.body;

    if (!amount || !orderId || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const outTradeNo = `${orderId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const assignedAdmin = await assignToAdmin();

    const payment = await Payment.create({
      orderId,
      paymentMethod: 'telebirr',
      amount,
      outTradeNo,
      status: 'pending',
      assignedAdmin,
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail
      },
      metadata: {
        subject: subject || 'Payment for order'
      }
    });

    const mockPaymentUrl = `${process.env.FRONTEND_URL}/mock-payment?outTradeNo=${outTradeNo}&amount=${amount}`;

    res.json({
      success: true,
      paymentUrl: mockPaymentUrl,
      outTradeNo,
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('❌ Telebirr initiation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check Telebirr payment status
// @route   GET /api/payment/telebirr/status/:outTradeNo
// @access  Private
export const checkTelebirrStatus = async (req, res) => {
  try {
    const { outTradeNo } = req.params;

    const payment = await Payment.findOne({ outTradeNo });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.expiresAt < new Date()) {
      payment.status = 'expired';
      await payment.save();
    }

    res.json({
      success: true,
      status: payment.status.toUpperCase(),
      transactionId: payment.transactionId,
      amount: payment.amount,
      message: `Payment is ${payment.status}`
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Handle Telebirr notification
// @route   POST /api/payment/telebirr/notify
// @access  Public
export const telebirrNotification = async (req, res) => {
  try {
    const { outTradeNo, transactionId, status } = req.body;

    const payment = await Payment.findOne({ outTradeNo });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = status === 'SUCCESS' ? 'completed' : 'failed';
    payment.transactionId = transactionId;
    
    if (status === 'SUCCESS') {
      payment.completedAt = new Date();
      
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'paid',
        paymentReference: transactionId
      });
    } else {
      payment.failedAt = new Date();
    }

    await payment.save();

    res.json({ code: 0, msg: 'success' });

  } catch (error) {
    console.error('❌ Notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Initialize Chapa payment
// @route   POST /api/payment/chapa/initiate
// @access  Private
export const initiateChapaPayment = async (req, res) => {
  try {
    const { amount, email, first_name, last_name, tx_ref, callback_url, return_url } = req.body;

    const order = await Order.findOne({ orderNumber: tx_ref });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const assignedAdmin = await assignToAdmin();

    const payment = await Payment.create({
      orderId: order._id,
      paymentMethod: 'chapa',
      amount,
      status: 'pending',
      assignedAdmin,
      customerInfo: {
        name: `${first_name} ${last_name}`.trim(),
        email,
      },
      metadata: {
        tx_ref,
        first_name,
        last_name
      }
    });

    const mockCheckoutUrl = `https://checkout.chapa.co/checkout/payment/${tx_ref}`;

    res.json({
      success: true,
      checkout_url: mockCheckoutUrl,
      tx_ref,
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('❌ Chapa payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate Chapa payment' });
  }
};

// @desc    Handle Chapa webhook
// @route   POST /api/payment/chapa/webhook
// @access  Public
export const chapaWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log('🔔 Chapa webhook received:', event.event);
    
    if (event.event === 'charge.success') {
      const { tx_ref, amount, first_name, last_name, payment_method, chapa_reference } = event.data;
      
      const order = await Order.findOne({ orderNumber: tx_ref });
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const payment = await Payment.findOne({ orderId: order._id });
      
      if (payment) {
        payment.status = 'completed';
        payment.transactionId = chapa_reference;
        payment.completedAt = new Date();
        await payment.save();
        
        order.paymentStatus = 'paid';
        order.paymentReference = chapa_reference;
        await order.save();
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Chapa webhook error:', error);
    res.sendStatus(500);
  }
};

// @desc    Chapa payment callback
// @route   GET /api/payment/chapa/callback
// @access  Public
export const chapaCallback = async (req, res) => {
  try {
    const { tx_ref, status, transaction_id } = req.query;
    
    console.log('🔔 Chapa callback received:', { tx_ref, status, transaction_id });

    const payment = await Payment.findOne({ 'metadata.tx_ref': tx_ref });
    
    if (payment) {
      payment.status = status === 'success' ? 'completed' : 'failed';
      payment.transactionId = transaction_id;
      if (status === 'success') {
        payment.completedAt = new Date();
        
        await Order.findByIdAndUpdate(payment.orderId, {
          paymentStatus: 'paid',
          paymentReference: transaction_id
        });
      }
      await payment.save();
    }

    res.redirect(`${process.env.FRONTEND_URL}/orders?payment=${status}`);
  } catch (error) {
    console.error('❌ Chapa callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/orders?payment=error`);
  }
};

// @desc    Generate bank transfer instructions
// @route   POST /api/payment/bank/instructions
// @access  Private
export const generateBankInstructions = async (req, res) => {
  try {
    const { amount, bankId, customerName, customerEmail, customerPhone, orderId } = req.body;

    const banks = {
      'cbe': {
        name: 'Commercial Bank of Ethiopia',
        accountName: 'TomShop PLC',
        accountNumber: '1000134567890',
        swiftCode: 'CBETETAA',
        branch: 'Head Office'
      },
      'dashen': {
        name: 'Dashen Bank',
        accountName: 'TomShop PLC',
        accountNumber: '12345678901',
        swiftCode: 'DASHETAA',
        branch: 'Main Branch'
      },
      'awash': {
        name: 'Awash Bank',
        accountName: 'TomShop PLC',
        accountNumber: '9876543210',
        swiftCode: 'AWINETAA',
        branch: 'Head Office'
      }
    };

    const selectedBank = banks[bankId] || banks['cbe'];
    const reference = `TOM-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const assignedAdmin = await assignToAdmin();

    const payment = await Payment.create({
      orderId,
      paymentMethod: 'bank_transfer',
      amount,
      status: 'pending',
      assignedAdmin,
      bankDetails: {
        ...selectedBank,
        reference
      },
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail
      },
      expiresAt: new Date(+new Date() + 48 * 60 * 60 * 1000)
    });

    res.json({
      success: true,
      instructions: {
        orderId,
        reference,
        amount,
        bank: selectedBank,
        instructions: {
          en: `Please transfer exactly ${amount.toLocaleString()} ETB to the account below. Use ${reference} as your payment reference.`,
          am: `እባክዎ በትክክል ${amount.toLocaleString()} ብር ከዚህ በታች ወደሚገኘው ሂሳብ ያስተላልፉ። እንደ ክፍያ ማጣቀሻ ${reference} ይጠቀሙ።`
        },
        qrCode: null,
        expiryTime: payment.expiresAt
      }
    });

  } catch (error) {
    console.error('❌ Bank instructions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get available banks
// @route   GET /api/payment/banks
// @access  Public
export const getBanks = async (req, res) => {
  try {
    const banks = [
      { id: 'cbe', name: 'Commercial Bank of Ethiopia' },
      { id: 'dashen', name: 'Dashen Bank' },
      { id: 'awash', name: 'Awash Bank' },
      { id: 'abyssinia', name: 'Abyssinia Bank' },
      { id: 'wegagen', name: 'Wegagen Bank' },
      { id: 'nib', name: 'NIB International Bank' }
    ];

    res.json({ success: true, banks });

  } catch (error) {
    console.error('❌ Get banks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify bank transfer
// @route   POST /api/payment/bank/verify
// @access  Private
export const verifyBankTransfer = async (req, res) => {
  try {
    const { orderId, reference, amount, transactionId } = req.body;
    const adminId = req.user._id;

    const payment = await Payment.findOne({
      orderId,
      'bankDetails.reference': reference,
      amount
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'completed';
    payment.transactionId = transactionId;
    payment.verifiedBy = adminId;
    payment.verifiedAt = new Date();
    payment.completedAt = new Date();
    await payment.save();

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      paymentReference: transactionId
    });

    res.json({ success: true, verified: true, message: 'Payment verified successfully' });

  } catch (error) {
    console.error('❌ Verify bank transfer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};