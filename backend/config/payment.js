import dotenv from 'dotenv';
dotenv.config();

export const paymentConfig = {
  // Telebirr Configuration
  telebirr: {
    // Production URLs (uncomment for production)
    // baseUrl: 'https://openapi.telebirr.com',
    // webBaseUrl: 'https://web.telebirr.com/wap/cashier/index',
    
    // Test URLs (for development - use sandbox if available)
    baseUrl: process.env.TELEBIRR_BASE_URL || 'https://openapi.telebirr.com',
    webBaseUrl: process.env.TELEBIRR_WEB_BASE_URL || 'https://web.telebirr.com/wap/cashier/index',
    
    appId: process.env.TELEBIRR_APP_ID,
    appKey: process.env.TELEBIRR_APP_KEY,
    appSecret: process.env.TELEBIRR_APP_SECRET,
    merchantId: process.env.TELEBIRR_MERCHANT_ID,
    merchantCode: process.env.TELEBIRR_MERCHANT_CODE,
    shortCode: process.env.TELEBIRR_SHORT_CODE || '6775',
    privateKey: process.env.TELEBIRR_PRIVATE_KEY,
    publicKey: process.env.TELEBIRR_PUBLIC_KEY,
    returnUrl: process.env.TELEBIRR_RETURN_URL || 'http://localhost:5173/payment/return',
    notifyUrl: process.env.TELEBIRR_NOTIFY_URL || 'https://your-domain.com/api/payment/telebirr-notify',
  },

  // Bank Transfer Configuration
  bankTransfer: {
    banks: [
      {
        id: 'cbe',
        name: 'Commercial Bank of Ethiopia',
        accountName: 'EthioShop PLC',
        accountNumber: '1000134567890',
        branch: 'Bole Branch',
        swiftCode: 'CBETETAA',
        logo: '/images/banks/cbe.png'
      },
      {
        id: 'dashen',
        name: 'Dashen Bank',
        accountName: 'EthioShop PLC',
        accountNumber: '9876543210',
        branch: 'Head Office',
        swiftCode: 'DASHETAA',
        logo: '/images/banks/dashen.png'
      },
      {
        id: 'awash',
        name: 'Awash Bank',
        accountName: 'EthioShop PLC',
        accountNumber: '1234567890',
        branch: 'Bole Branch',
        swiftCode: 'AWINETAA',
        logo: '/images/banks/awash.png'
      }
    ],
    
    // Payment verification settings
    verificationTimeout: 24 * 60 * 60 * 1000, // 24 hours
    minAmount: 10, // Minimum transfer amount in ETB
    
    // Bank payment instructions
    instructions: {
      en: 'Please transfer the exact amount to the bank account below. Include your order number as reference.',
      am: 'እባክዎ ትክክለኛውን መጠን ከዚህ በታች ወደሚገኘው የባንክ ሂሳብ ይላኩ። የትዕዛዝ ቁጥርዎን እንደ ማጣቀሻ ያካትቱ።'
    }
  },

  // Order expiration
  orderExpiry: 30 * 60 * 1000, // 30 minutes
};