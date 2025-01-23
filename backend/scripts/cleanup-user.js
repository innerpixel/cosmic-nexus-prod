#!/usr/bin/env node
import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
dotenv.config({ path: '.env.development' });

async function removeSystemUser(username) {
  try {
    const { stdout, stderr } = await execAsync(`id ${username}`);
    if (!stderr) {
      console.log(`Found system user ${username}, removing...`);
      await execAsync(`SUDO_ASKPASS=./sudo-askpass.sh sudo -A userdel -r ${username}`);
      console.log(`System user ${username} removed successfully`);
    }
  } catch (error) {
    if (error.code === 1) {
      console.log(`System user ${username} not found`);
    } else {
      console.error(`Error removing system user: ${error.message}`);
    }
  }
}

async function cleanupDatabase(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get the User model
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      username: String,
      displayName: String,
      password: String,
      isVerified: Boolean,
      verificationToken: String
    }));
    
    // Remove user from database
    const result = await User.deleteOne({ email });
    if (result.deletedCount > 0) {
      console.log(`User ${email} removed from database`);
    } else {
      console.log(`User ${email} not found in database`);
    }
  } catch (error) {
    console.error(`Error cleaning up database: ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }
}

async function cleanupAll(email) {
  try {
    const username = email.split('@')[0];
    await removeSystemUser(username);
    await cleanupDatabase(email);
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const email = args[1];

if (command === 'remove' && email) {
  cleanupAll(email);
} else {
  console.log('Usage: node cleanup-user.js remove <email>');
  process.exit(1);
}
