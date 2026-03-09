import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testAuth = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Test creating a user
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    };

    // Check if user exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('📋 Test user already exists');
      console.log('Email:', existingUser.email);
      console.log('Full Name:', existingUser.fullName);
    } else {
      // Create test user
      const user = await User.create(testUser);
      console.log('✅ Test user created successfully');
      console.log('Email:', user.email);
      console.log('Full Name:', user.fullName);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testAuth();