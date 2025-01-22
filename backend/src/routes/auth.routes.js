import express from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import pkg from 'ethereal-email';
const { createTestAccount, createTransport } = pkg;
import storageService from '../services/storage.service.js';
import User from '../models/user.model.js';

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

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { displayName, csmclName, simNumber, password, regularEmail } = req.body;
    
    // Basic validation
    if (!displayName || !csmclName || !simNumber || !password || !regularEmail) {
      return res.status(400).json({ 
        status: 'error',
        message: 'All fields are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ csmclName }, { regularEmail }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error',
        message: 'User already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user
    const user = new User({
      displayName,
      csmclName,
      simNumber,
      password: hashedPassword,
      regularEmail,
      verificationToken,
      verificationExpires,
      isEmailVerified: false
    });
    
    // Save user to database
    await user.save();
    
    // Setup Ethereal email for testing
    const emailTransporter = await setupEtherealEmail();
    
    // Send verification email
    const info = await emailTransporter.sendMail({
      from: '"Cosmic Nexus Test" <test@ethereal.email>',
      to: regularEmail,
      subject: 'Verify your email - Cosmic Nexus',
      text: `Welcome ${displayName}! Please verify your email using this token: ${verificationToken}\nOr click this link: ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
      html: `
        <h1>Welcome ${displayName}!</h1>
        <p>Please verify your email by either:</p>
        <p>1. Using this token: <strong>${verificationToken}</strong></p>
        <p>2. Clicking this link: <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a></p>
      `,
    });
    
    console.log('Verification email sent:', info);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    // Create user storage folders
    await storageService.createUserFolders(csmclName);
    
    res.status(201).json({ 
      status: 'success',
      message: 'User registered successfully. Please check your email for verification.',
      emailPreview: nodemailer.getTestMessageUrl(info)
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Registration failed' 
    });
  }
});

// Email verification endpoint - handles both URL token and pasted token
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
        message: 'Verification token has expired. Please request a new one.' 
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

// URL-based verification endpoint
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with this verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.redirect('/verify-email?error=invalid-token');
    }

    if (user.isEmailVerified) {
      return res.redirect('/verify-email?error=already-verified');
    }

    // Check if token is expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return res.redirect('/verify-email?error=token-expired');
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.redirect('/verify-email?status=success');
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect('/verify-email?error=server-error');
  }
});

// Resend verification token endpoint
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ regularEmail: email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Setup Ethereal email for testing
    const emailTransporter = await setupEtherealEmail();
    
    // Send new verification email
    const info = await emailTransporter.sendMail({
      from: '"Cosmic Nexus Test" <test@ethereal.email>',
      to: user.regularEmail,
      subject: 'New Verification Token - Cosmic Nexus',
      text: `Hello ${user.displayName}! Here's your new verification token: ${verificationToken}`,
      html: `
        <h1>Hello ${user.displayName}!</h1>
        <p>You requested a new verification token. Here it is:</p>
        <p><strong>${verificationToken}</strong></p>
        <p>You can also click this link to verify your email:</p>
        <p><a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a></p>
      `,
    });
    
    console.log('New verification email sent:', info);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    res.json({
      status: 'success',
      message: 'New verification token sent. Please check your email.',
      emailPreview: nodemailer.getTestMessageUrl(info)
    });

  } catch (error) {
    console.error('Error resending verification token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend verification token'
    });
  }
});

// Delete user endpoint
router.delete('/user/:csmclName', async (req, res) => {
  try {
    const { csmclName } = req.params;
    
    // Find and delete user
    const user = await User.findOne({ csmclName });
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
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
