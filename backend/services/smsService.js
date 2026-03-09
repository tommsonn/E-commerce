import twilio from 'twilio';
import crypto from 'crypto';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const client = twilio(accountSid, authToken);

/**
 * Generate a random 6-digit verification code
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send SMS verification code using Twilio Verify API [citation:8]
 */
export const sendSmsVerification = async (phoneNumber, code) => {
  try {
    // Format phone number (ensure it has country code)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+251${phoneNumber.replace(/^0+/, '')}`; // Ethiopia country code +251

    console.log(`📱 Sending SMS to ${formattedPhone} with code: ${code}`);

    // Method 1: Using Twilio Verify API (recommended) [citation:8]
    if (verifyServiceSid) {
      const verification = await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({
          to: formattedPhone,
          channel: 'sms'
        });
      
      console.log('✅ Twilio verification created:', verification.sid);
      return {
        success: true,
        message: 'Verification code sent',
        method: 'twilio-verify',
        sid: verification.sid
      };
    }

    // Method 2: Direct SMS sending
    const message = await client.messages.create({
      body: `Your EthioShop verification code is: ${code}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('✅ SMS sent:', message.sid);
    return {
      success: true,
      messageId: message.sid,
      method: 'direct-sms'
    };
  } catch (error) {
    console.error('❌ SMS sending error:', error);
    
    // For development/testing, log the code
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ DEV MODE - SMS Code for ${phoneNumber}: ${code}`);
      return {
        success: true,
        devMode: true,
        code: code,
        message: 'DEV MODE: SMS sending simulated'
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify SMS code using Twilio Verify API [citation:8]
 */
export const verifySmsCode = async (phoneNumber, code) => {
  try {
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+251${phoneNumber.replace(/^0+/, '')}`;

    if (verifyServiceSid) {
      const verificationCheck = await client.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({
          to: formattedPhone,
          code: code
        });

      return {
        success: verificationCheck.status === 'approved',
        status: verificationCheck.status,
        method: 'twilio-verify'
      };
    }

    // For direct SMS, we'll verify against stored code
    // This is handled in the controller
    return {
      success: true,
      method: 'direct'
    };
  } catch (error) {
    console.error('❌ SMS verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};