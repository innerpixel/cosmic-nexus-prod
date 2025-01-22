import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';

// Load environment variables
dotenv.config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmic-nexus-dev';
    console.log('Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log('\nFound users:', users.length);
    
    if (users.length > 0) {
      users.forEach(user => {
        console.log('\nUser:', {
          displayName: user.displayName,
          csmclName: user.csmclName,
          regularEmail: user.regularEmail,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        });
      });
    } else {
      console.log('No users found in database');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUsers();
