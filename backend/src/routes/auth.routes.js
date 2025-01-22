import express from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { createTestAccount, createTransport } from 'ethereal-email';
import { StorageService } from '../services/storage.service.js';
import User from '../models/user.model.js'; 

const storageService = new StorageService();
const router = express.Router();

// Create Ethereal test account for development
let testAccount = null;
let transporter = null;

async function setupEtherealEmail() {
  if (!testAccount) {
    testAccount = await createTestAccount();
    console.log('Created Ethereal test account:', testAccount.user);
    
    transporter = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
}

// In-memory user storage for development
const users = new Map();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with verification token
    const user = {
      email,
      name,
      password: hashedPassword,
      verificationToken: req.body.verificationToken || Math.random().toString(36).substring(2),
      verificationExpires: req.body.verificationExpires || new Date(Date.now() + 24 * 60 * 60 * 1000),
      isEmailVerified: false
    };
    
    // Save user
    users.set(email, user);
    
    // Setup Ethereal email for testing
    const emailTransporter = await setupEtherealEmail();
    
    // Send verification email
    const info = await emailTransporter.sendMail({
      from: '"Cosmic Nexus Test" <test@ethereal.email>',
      to: email,
      subject: 'Verify your email - Cosmic Nexus',
      text: `Welcome ${name}! Please verify your email using this token: ${user.verificationToken}`,
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Please verify your email using this token:</p>
        <p><strong>${user.verificationToken}</strong></p>
      `,
    });
    
    console.log('Verification email sent:', info);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    res.status(201).json({ 
      message: 'Registration successful',
      user: { id: user.email, email: user.email, name: user.name },
      emailPreview: nodemailer.getTestMessageUrl(info)
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
    const user = Array.from(users.values()).find(u => u.verificationToken === token);

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
    if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Verification token has expired' 
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    users.set(user.email, user);

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
router.delete('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find and delete user
    const user = users.get(email);
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    // Delete user's storage folders
    await storageService.deleteUserFolders(email);
    
    // Delete user
    users.delete(email);

    // Execute system user removal command
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync(`sudo userdel -r ${email}`);
    } catch (error) {
      // If system user doesn't exist, we can ignore the error
      console.log(`System user removal: ${error.message}`);
    }

    res.json({ 
      status: 'success',
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete user' 
    });
  }
});

export default router;
