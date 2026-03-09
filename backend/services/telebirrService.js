import axios from 'axios';
import crypto from 'crypto';
import forge from 'node-forge';

class TelebirrService {
  constructor() {
    // Your credentials from .env
    this.appId = process.env.TELEBIRR_APP_ID;
    this.appKey = process.env.TELEBIRR_APP_KEY;
    this.appSecret = process.env.TELEBIRR_APP_SECRET;
    this.publicKey = process.env.TELEBIRR_PUBLIC_KEY;
    this.privateKey = process.env.TELEBIRR_PRIVATE_KEY;
    
    // API endpoints
    this.baseUrl = process.env.TELEBIRR_BASE_URL || 'https://196.188.120.3:11443';
    this.paymentPath = '/service-openup/toTradeWebPay';
    
    // Default values
    this.shortCode = process.env.TELEBIRR_SHORT_CODE || '220183';
    this.receiveName = process.env.TELEBIRR_RECEIVE_NAME || 'EthioShop';
    this.timeoutExpress = '30'; // minutes
    this.notifyUrl = process.env.TELEBIRR_NOTIFY_URL || 'http://localhost:5000/api/payment/telebirr/notify';
    this.returnUrl = process.env.TELEBIRR_RETURN_URL || 'http://localhost:5173/payment/status';
  }

  /**
   * Generate a unique nonce (random string) - each request can only be used once
   */
  generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate timestamp in milliseconds
   */
  generateTimestamp() {
    return Date.now().toString();
  }

  /**
   * Generate unique outTradeNo (merchant order ID) - each request can only be used once
   */
  generateOutTradeNo(orderId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${orderId}-${timestamp}-${random}`;
  }

  /**
   * Step 1: Generate StringA by concatenating parameters in ascending order
   * Parameters order: appId, nonce, outTradeNo, receiveName, returnUrl, notifyUrl, 
   * shortCode, subject, timeoutExpress, timestamp, totalAmount
   */
  generateStringA(params) {
    const {
      appId,
      nonce,
      outTradeNo,
      receiveName,
      returnUrl,
      notifyUrl,
      shortCode,
      subject,
      timeoutExpress,
      timestamp,
      totalAmount
    } = params;

    // Concatenate in ascending order as per Telebirr documentation [citation:3][citation:6]
    return `${appId}${nonce}${outTradeNo}${receiveName}${returnUrl}${notifyUrl}${shortCode}${subject}${timeoutExpress}${timestamp}${totalAmount}`;
  }

  /**
   * Step 2 & 3: Generate SHA256 hash and capitalize to get signature
   */
  generateSignature(stringA) {
    const hash = crypto.createHash('sha256').update(stringA).digest('hex');
    return hash.toUpperCase(); // Capitalize all letters as required [citation:6]
  }

  /**
   * Step 4 & 5: Convert parameters to JSON and encrypt with RSA public key
   */
  encryptData(params) {
    // Convert all parameters to JSON string (ussdjson) [citation:6]
    const ussdjson = JSON.stringify({
      appId: params.appId,
      nonce: params.nonce,
      outTradeNo: params.outTradeNo,
      receiveName: params.receiveName,
      returnUrl: params.returnUrl,
      notifyUrl: params.notifyUrl,
      shortCode: params.shortCode,
      subject: params.subject,
      timeoutExpress: params.timeoutExpress,
      timestamp: params.timestamp,
      totalAmount: params.totalAmount
    });

    console.log('📦 USSD JSON:', ussdjson);

    try {
      // RSA 2048 encryption with public key [citation:3]
      const publicKey = forge.pki.publicKeyFromPem(this.publicKey);
      const encrypted = publicKey.encrypt(ussdjson, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: forge.mgf.mgf1.create(forge.md.sha256.create())
      });
      
      // Convert to base64
      return forge.util.encode64(encrypted);
    } catch (error) {
      console.error('❌ RSA Encryption error:', error);
      
      // Fallback for development - base64 encode (DO NOT USE IN PRODUCTION)
      console.warn('⚠️ Using base64 fallback - NOT SECURE for production!');
      return Buffer.from(ussdjson).toString('base64');
    }
  }

  /**
   * Step 6: Assemble final request message [citation:6]
   */
  assembleRequest(appId, sign, ussd) {
    return {
      appid: appId,
      sign: sign,
      ussd: ussd
    };
  }

  /**
   * Create payment order and get payment URL
   */
  async createPaymentOrder(orderData) {
    try {
      const {
        orderId,
        amount,
        subject,
        customerPhone,
        customerEmail,
        customerName
      } = orderData;

      console.log('🔍 Creating Telebirr payment order...');
      
      // Generate required parameters
      const nonce = this.generateNonce();
      const timestamp = this.generateTimestamp();
      const outTradeNo = this.generateOutTradeNo(orderId);
      
      // Prepare parameters
      const params = {
        appId: this.appId,
        nonce: nonce,
        outTradeNo: outTradeNo,
        receiveName: this.receiveName,
        returnUrl: this.returnUrl,
        notifyUrl: this.notifyUrl,
        shortCode: this.shortCode,
        subject: subject || 'EthioShop Payment',
        timeoutExpress: this.timeoutExpress,
        timestamp: timestamp,
        totalAmount: amount.toString()
      };

      console.log('📋 Payment parameters:', params);

      // Step 1: Generate StringA
      const stringA = this.generateStringA(params);
      console.log('📝 StringA:', stringA);

      // Step 2 & 3: Generate signature
      const sign = this.generateSignature(stringA);
      console.log('🔏 Signature:', sign);

      // Step 4 & 5: Encrypt data
      const ussd = this.encryptData(params);
      console.log('🔐 Encrypted USSD:', ussd.substring(0, 50) + '...');

      // Step 6: Assemble request
      const requestData = this.assembleRequest(this.appId, sign, ussd);
      console.log('📤 Request data:', requestData);

      // Step 7: Send to Telebirr API
      const apiUrl = `${this.baseUrl}${this.paymentPath}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        // Ignore SSL certificate issues in development
        httpsAgent: new (await import('https')).Agent({
          rejectUnauthorized: false
        })
      });

      console.log('📥 Telebirr response:', response.data);

      // Parse response
      if (response.data && response.data.code === 0) {
        // Success - payment URL should be in response
        // The user will be redirected to this URL to enter their phone and PIN [citation:5]
        const paymentUrl = response.data.data?.toPayUrl || 
                          response.data.data?.paymentUrl || 
                          response.data.data?.url;
        
        return {
          success: true,
          paymentUrl: paymentUrl,
          outTradeNo: outTradeNo,
          transactionId: response.data.data?.transactionId,
          rawResponse: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.msg || 'Payment initialization failed',
          rawResponse: response.data
        };
      }
    } catch (error) {
      console.error('❌ Telebirr API error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.msg || error.message
      };
    }
  }

  /**
   * Decrypt Telebirr notification [citation:3]
   */
  decryptNotification(encryptedData) {
    try {
      if (!this.privateKey) {
        console.warn('⚠️ No private key provided, cannot decrypt');
        return encryptedData;
      }

      const privateKey = forge.pki.privateKeyFromPem(this.privateKey);
      const encrypted = forge.util.decode64(encryptedData);
      const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: forge.mgf.mgf1.create(forge.md.sha256.create())
      });
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('❌ Decryption error:', error);
      return null;
    }
  }

  /**
   * Query payment status [citation:4]
   */
  async queryPaymentStatus(outTradeNo) {
    try {
      // Generate query parameters
      const nonce = this.generateNonce();
      const timestamp = this.generateTimestamp();
      
      // Prepare query params
      const params = {
        appId: this.appId,
        nonce: nonce,
        outTradeNo: outTradeNo,
        timestamp: timestamp
      };

      // Generate signature
      const stringA = `${this.appId}${nonce}${outTradeNo}${timestamp}`;
      const sign = this.generateSignature(stringA);
      
      // Encrypt data
      const ussd = this.encryptData(params);

      const requestData = {
        appid: this.appId,
        sign: sign,
        ussd: ussd
      };

      const response = await axios.post(
        `${this.baseUrl}/service-openup/toQuery`,
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
          httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: false })
        }
      );

      if (response.data && response.data.code === 0) {
        return {
          success: true,
          status: response.data.data?.status,
          amount: response.data.data?.totalAmount,
          transactionId: response.data.data?.transactionId,
          rawResponse: response.data
        };
      }

      return {
        success: false,
        error: response.data.msg || 'Query failed'
      };
    } catch (error) {
      console.error('❌ Query error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new TelebirrService();