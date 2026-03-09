import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Contact from './models/Contact.js';

dotenv.config();

const testContact = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count contacts
    const count = await Contact.countDocuments();
    console.log(`📊 Total contacts in database: ${count}`);

    // Get unread count
    const unread = await Contact.countDocuments({ isRead: false });
    console.log(`📊 Unread contacts: ${unread}`);

    // Show recent contacts
    const recent = await Contact.find().sort('-createdAt').limit(5);
    console.log('\n📬 Recent contacts:');
    recent.forEach(c => {
      console.log(`- ${c.name}: ${c.subject} (${c.createdAt})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testContact();