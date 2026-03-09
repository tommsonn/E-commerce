import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['telebirr', 'bank_transfer', 'chapa'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    sparse: true
  },
  outTradeNo: {
    type: String,
    sparse: true,
    unique: true
  },
  // Admin tracking fields
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  // Bank transfer specific
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    swiftCode: String,
    reference: String
  },
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*60*1000) // 30 minutes
  },
  completedAt: Date,
  failedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ outTradeNo: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ assignedAdmin: 1 }); 

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;