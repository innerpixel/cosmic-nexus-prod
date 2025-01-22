#!/usr/bin/env node
const mongoose = require('mongoose');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
require('dotenv').config({ path: '.env.development' });

async function removeSystemUser(username) {
  try {
    const { stdout, stderr } = await execAsync(`id ${username}`);
    if (!stderr) {
      console.log(`Found system user ${username}, removing...`);
      await execAsync(`sudo userdel -r ${username}`);
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
      password: String,
      name: String,
      csmclName: String,
      simNumber: String,
      isVerified: Boolean,
      verificationToken: String,
      verificationTokenExpires: Date
    }));

    // Find and remove the user
    const user = await User.findOne({ email });
    if (user) {
      const username = user.csmclName;
      await User.deleteOne({ email });
      console.log(`Database user ${email} removed successfully`);
      
      // Remove system user if exists
      await removeSystemUser(username);
    } else {
      console.log(`No user found with email ${email}`);
    }

  } catch (error) {
    console.error('Database cleanup error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

async function cleanupAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Drop the users collection
    await mongoose.connection.dropCollection('users');
    console.log('Users collection dropped successfully');

    // Get list of all CSMCL users from system
    const { stdout } = await execAsync("grep -l 'CSMCL User' /etc/passwd");
    if (stdout) {
      const users = stdout.split('\n').filter(Boolean);
      for (const user of users) {
        await removeSystemUser(user);
      }
    }

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Users collection does not exist');
    } else {
      console.error('Cleanup error:', error.message);
    }
  } finally {
    await mongoose.connection.close();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const email = args[1];

if (command === 'clean-user' && email) {
  cleanupDatabase(email)
    .then(() => console.log('Cleanup completed'))
    .catch(console.error);
} else if (command === 'clean-all') {
  cleanupAll()
    .then(() => console.log('Full cleanup completed'))
    .catch(console.error);
} else {
  console.log(`
Usage:
  Clean specific user:  node cleanup-user.js clean-user <email>
  Clean all users:      node cleanup-user.js clean-all
  `);
}
