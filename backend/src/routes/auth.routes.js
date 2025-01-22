import express from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { createTestAccount, createTransport } from 'ethereal-email';
import { StorageService } from '../services/storage.service.js';
import User from '../models/user.model.js'; // Add User model import

const storageService = new StorageService();
const router = express.Router();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: 'cosmical.me',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.MAIL_USER || 'noreply@cosmical.me',
    pass: process.env.MAIL_PASS
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      email,
      name,
      password: hashedPassword
    });
    
    // Save user to database
    await user.save();
    
    // Send welcome email
    const info = await transporter.sendMail({
      from: '"Cosmic Nexus" <noreply@cosmical.me>',
      to: email,
      subject: 'Welcome to Cosmic Nexus!',
      text: `Welcome ${name}! Thank you for registering with Cosmic Nexus.`,
      html: `<h1>Welcome ${name}!</h1><p>Thank you for registering with Cosmic Nexus.</p>`,
    });
    
    console.log('Welcome email sent:', info);
    
    // Update user storage
    await storageService.createUserFolders(user.email);
    
    res.status(201).json({ 
      message: 'Registration successful',
      user: { id: user.id, email: user.email, name: user.name },
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Verification token is required' 
      });
    }

    // Find user with this verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Invalid verification token' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Email is already verified' 
      });
    }

    // Check if token is expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Verification token has expired' 
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({ 
      status: 'success',
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred during email verification' 
    });
  }
});

// Delete user endpoint
router.delete('/user/:csmclName', async (req, res) => {
  try {
    const { csmclName } = req.params;
    
    // Find and delete user from database
    const user = await User.findOne({ csmclName });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's storage folders
    await storageService.deleteUserFolders(csmclName);
    
    // Delete user from database
    await User.deleteOne({ csmclName });

    // Execute system user removal command
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync(`sudo userdel -r ${csmclName}`);
    } catch (error) {
      // If system user doesn't exist, we can ignore the error
      console.log(`System user removal: ${error.message}`);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
