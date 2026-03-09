import { paymentConfig } from '../config/payment.js';
import { generateTransactionId, generateQRCode } from '../utils/paymentUtils.js';

class BankTransferService {
  constructor() {
    this.config = paymentConfig.bankTransfer;
    this.banks = this.config.banks;
    this.verificationTimeout = this.config.verificationTimeout;
  }

  // Get all supported banks
  getBanks() {
    return this.banks;
  }

  // Get bank by ID
  getBankById(bankId) {
    return this.banks.find(bank => bank.id === bankId);
  }

  // Generate payment instructions
  async generatePaymentInstructions(orderData) {
    const { orderId, amount, bankId, customerName, customerEmail, customerPhone } = orderData;
    
    // Get selected bank
    const bank = this.getBankById(bankId) || this.banks[0];
    
    // Generate reference number
    const referenceNumber = generateTransactionId('BNK');
    
    // Prepare payment data
    const paymentData = {
      orderId: orderId,
      amount: amount,
      reference: referenceNumber,
      bank: bank,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      expiryTime: new Date(Date.now() + this.verificationTimeout).toISOString(),
      instructions: {
        en: this.config.instructions.en,
        am: this.config.instructions.am
      }
    };

    // Generate QR code with payment details
    const qrData = {
      ref: referenceNumber,
      amt: amount,
      acc: bank.accountNumber,
      bank: bank.id,
      order: orderId
    };
    
    const qrCode = await generateQRCode(qrData);

    return {
      ...paymentData,
      qrCode
    };
  }

  // Verify bank transfer
  async verifyTransfer(verificationData) {
    const { reference, amount, transactionId, customerName } = verificationData;
    
    // In production, you would:
    // 1. Check with bank API if transfer is complete
    // 2. Verify amount matches
    // 3. Check reference number
    // 4. Confirm within time limit
    
    // For now, we'll simulate verification
    const isValid = true;
    const verificationTime = new Date().toISOString();

    if (isValid) {
      return {
        success: true,
        verified: true,
        reference: reference,
        amount: amount,
        transactionId: transactionId || generateTransactionId('BNK'),
        verificationTime: verificationTime,
        message: 'Payment verified successfully'
      };
    }

    return {
      success: false,
      verified: false,
      reference: reference,
      message: 'Payment verification failed'
    };
  }

  // Generate bank transfer receipt
  generateReceipt(verificationData) {
    const {
      orderId,
      amount,
      reference,
      bank,
      customerName,
      verificationTime
    } = verificationData;

    const receiptNumber = generateTransactionId('RCP');
    
    return {
      receiptNumber: receiptNumber,
      orderId: orderId,
      amount: amount,
      reference: reference,
      bankName: bank.name,
      accountNumber: bank.accountNumber,
      customerName: customerName,
      paymentDate: verificationTime,
      status: 'completed'
    };
  }
}

export default new BankTransferService();