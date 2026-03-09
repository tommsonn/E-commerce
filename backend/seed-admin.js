import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    
    if (adminExists) {
      console.log('⚠️ Admin already exists');
      
      // If exists but not verified, update to verified
      if (!adminExists.isEmailVerified) {
        adminExists.isEmailVerified = true;
        await adminExists.save();
        console.log('✅ Admin account has been verified!');
      }
      
      await mongoose.disconnect();
      return;
    }

    // Create admin user with email pre-verified
    const admin = await User.create({
      email: 'admin@gmail.com',
      password: 'admin123', // Change this!
      fullName: 'System Administrator',
      phone: '+251941287843',
      isAdmin: true,
      isEmailVerified: true, // 👈 IMPORTANT: Set to true
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('✅ Email verified: Yes');
    console.log('⚠️ IMPORTANT: Change this password after first login!');
    
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

createAdmin();