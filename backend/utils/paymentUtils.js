import crypto from 'crypto';
import axios from 'axios';
import { paymentConfig } from '../config/payment.js';

// Generate unique transaction ID
export const generateTransactionId = (prefix = 'TXN') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Generate order number
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
};

// RSA Encryption for Telebirr
export const rsaEncrypt = (data, publicKey) => {
  try {
    const buffer = Buffer.from(data);
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  } catch (error) {
    console.error('RSA Encryption error:', error);
    throw error;
  }
};

// SHA256 Hash
export const sha256Hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex').toUpperCase();
};

// HMAC SHA256 for signature
export const hmacSha256 = (data, key) => {
  return crypto.createHmac('sha256', key).update(data).digest('hex').toUpperCase();
};

// Generate random string
export const generateRandomString = (length = 16) => {
  return crypto.randomBytes(length).toString('hex').toUpperCase();
};

// Format amount for Telebirr (in cents/paisa)
export const formatAmount = (amount) => {
  return Math.round(amount * 100).toString();
};

// Format date for Telebirr (YYYYMMDDHHmmss)
export const formatDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Generate QR Code for bank transfer
export const generateQRCode = async (data) => {
  try {
    const QRCode = (await import('qrcode')).default;
    const qrData = typeof data === 'string' ? data : JSON.stringify(data);
    const qrCode = await QRCode.toDataURL(qrData);
    return qrCode;
  } catch (error) {
    console.error('QR Code generation error:', error);
    return null;
  }
};