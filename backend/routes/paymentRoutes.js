import express from 'express';
import {
  initiateTelebirrPayment,
  checkTelebirrStatus,
  telebirrNotification,
  initiateChapaPayment,
  chapaWebhook,
  chapaCallback,
  generateBankInstructions,
  getBanks,
  verifyBankTransfer
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============== TELEBIRR ROUTES ==============

/**
 * @route   POST /api/payment/telebirr/initiate
 * @desc    Initialize Telebirr payment
 * @access  Private
 */
router.post('/telebirr/initiate', protect, initiateTelebirrPayment);

/**
 * @route   GET /api/payment/telebirr/status/:outTradeNo
 * @desc    Check Telebirr payment status
 * @access  Private
 */
router.get('/telebirr/status/:outTradeNo', protect, checkTelebirrStatus);

/**
 * @route   POST /api/payment/telebirr/notify
 * @desc    Telebirr payment notification (callback)
 * @access  Public
 */
router.post('/telebirr/notify', telebirrNotification);

// ============== CHAPA ROUTES ==============

/**
 * @route   POST /api/payment/chapa/initiate
 * @desc    Initialize Chapa payment
 * @access  Private
 */
router.post('/chapa/initiate', protect, initiateChapaPayment);

/**
 * @route   POST /api/payment/chapa/webhook
 * @desc    Chapa webhook for payment notifications
 * @access  Public
 */
router.post('/chapa/webhook', chapaWebhook);

/**
 * @route   GET /api/payment/chapa/callback
 * @desc    Chapa payment callback (redirect)
 * @access  Public
 */
router.get('/chapa/callback', chapaCallback);

// ============== BANK TRANSFER ROUTES ==============

/**
 * @route   GET /api/payment/banks
 * @desc    Get list of available banks
 * @access  Public
 */
router.get('/banks', getBanks);

/**
 * @route   POST /api/payment/bank/instructions
 * @desc    Generate bank transfer instructions
 * @access  Private
 */
router.post('/bank/instructions', protect, generateBankInstructions);

/**
 * @route   POST /api/payment/bank/verify
 * @desc    Verify bank transfer
 * @access  Private
 */
router.post('/bank/verify', protect, verifyBankTransfer);

export default router;