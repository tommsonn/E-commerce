import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required email environment variables:', missingVars);
}

// Create transporter with better configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Only for development
  },
  debug: true, // Enable debug logs
  logger: true, // Log to console
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email server connection failed:', error);
    console.log('\n📋 Troubleshooting tips:');
    console.log('1. Check if EMAIL_USER and EMAIL_PASS are correct');
    console.log('2. For Gmail, make sure you\'re using an App Password');
    console.log('3. App Password should be 16 characters with no spaces');
    console.log('4. Enable 2-Factor Authentication at: https://myaccount.google.com/security');
    console.log('5. Generate App Password at: https://myaccount.google.com/apppasswords');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send email function with better error handling
export const sendEmail = async (options) => {
  try {
    console.log('📧 Preparing to send email to:', options.email);
    
    // Validate inputs
    if (!options.email) {
      throw new Error('Recipient email is required');
    }
    
    if (!options.subject || !options.html) {
      throw new Error('Email subject and content are required');
    }

    const mailOptions = {
      from: `"TomShop" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📨 Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication failed. Please check:');
      console.error('1. Your email credentials');
      console.error('2. For Gmail, use an App Password (not your regular password)');
      console.error('3. App Password should be 16 characters with no spaces');
    } else if (error.code === 'ESOCKET') {
      console.error('\n🌐 Connection failed. Please check:');
      console.error('1. Your internet connection');
      console.error('2. EMAIL_HOST and EMAIL_PORT settings');
    }
    
    throw error;
  }
};

// Email templates with TomShop branding
export const emailTemplates = {
  // Welcome email after verification
  welcome: (name) => ({
    subject: 'Welcome to TomShop! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">TomShop</h1>
          <h2 style="color: #333; text-align: center;">Welcome Aboard! 🎉</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your email has been successfully verified! Welcome to the TomShop family.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Start exploring thousands of products with fast delivery across Ethiopia.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/shop" 
               style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Start Shopping
            </a>
          </div>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} TomShop. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  // Email verification template
  verifyEmail: (name, token) => ({
    subject: 'Verify Your Email - TomShop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">TomShop</h1>
          <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for registering with TomShop! Please verify your email address to activate your account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" 
               style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #999; font-size: 14px;">
            If you didn't create an account with TomShop, please ignore this email.
          </p>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} TomShop. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  // Password reset template
  resetPassword: (name, token) => ({
    subject: 'Reset Your Password - TomShop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">TomShop</h1>
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" 
               style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 14px;">
            If you didn't request a password reset, please ignore this email or contact support.
          </p>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} TomShop. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  // Order confirmation template
  orderConfirmation: (name, order) => ({
    subject: `Order Confirmation #${order.orderNumber} - TomShop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">TomShop</h1>
          <h2 style="color: #333; text-align: center;">Order Confirmed! 🎉</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for your order! Your order has been confirmed and is being processed.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ETB ${order.totalAmount}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Order Details
            </a>
          </div>

          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Need help? Contact us at support@tomshop.com
          </p>
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} TomShop. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  // Contact form auto-reply
  contactAutoReply: (name) => ({
    subject: 'Thank You for Contacting TomShop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">TomShop</h1>
          <h2 style="color: #333; text-align: center;">Thank You for Contacting Us</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for reaching out to TomShop! We have received your message and will get back to you within 24 hours.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            In the meantime, feel free to continue shopping on our website.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/shop" 
               style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Continue Shopping
            </a>
          </div>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} TomShop. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),
};

// Helper function to send different types of emails
export const sendEmailWithTemplate = async (to, templateName, data) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template "${templateName}" not found`);
    }

    const { subject, html } = template(data);
    
    await sendEmail({
      email: to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error(`❌ Failed to send ${templateName} email:`, error);
    return false;
  }
};