import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';

// Load environment variables
dotenv.config();

async function cleanDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmic-nexus-dev';
    console.log('Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Count users before deletion
    const beforeCount = await User.countDocuments();
    console.log(`\nFound ${beforeCount} users before cleanup`);

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);

    // Verify deletion
    const afterCount = await User.countDocuments();
    console.log(`Users remaining: ${afterCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Ask for confirmation before proceeding
console.log('\n⚠️  WARNING: This will delete all users from the database!');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');

setTimeout(cleanDatabase, 5000);
