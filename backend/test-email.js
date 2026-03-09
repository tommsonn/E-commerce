import dotenv from 'dotenv';
import { sendEmail, emailTemplates } from './utils/email.js';

dotenv.config();

const testEmail = async () => {
  try {
    console.log('📧 Testing email configuration...');
    console.log('Using:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
    });

    await sendEmail({
      email: process.env.EMAIL_USER, // Send to yourself
      ...emailTemplates.welcome('Test User')
    });

    console.log('✅ Test email sent successfully! Check your inbox.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testEmail();