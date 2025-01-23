import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import emailAccountService from '../services/email-account.service.js';
import User from '../models/user.model.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { displayName, csmclName, simNumber, password, regularEmail } = req.body;
    console.log('Registration attempt for:', { displayName, csmclName, regularEmail });
    
    // Basic validation
    if (!displayName || !csmclName || !simNumber || !password || !regularEmail) {
      console.log('Validation failed - missing fields');
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
      console.log('User already exists in MongoDB:', existingUser.csmclName);
      return res.status(400).json({ 
        status: 'error',
        message: 'User already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    console.log('Generated verification token');
    
    // Create user
    const user = new User({
      displayName,
      csmclName,
      simNumber,
      regularEmail: regularEmail.toLowerCase(),
      password: hashedPassword,
      verificationToken,
      verificationExpires
    });

    await user.save();
    console.log('User saved to MongoDB:', user.csmclName);

    // Send verification email
    try {
      await emailAccountService.sendVerificationEmail(user);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue with user creation even if email fails
    }

    res.status(201).json({
      status: 'pending',
      message: 'Registration started. User creation in progress.',
      data: {
        displayName: user.displayName,
        csmclName: user.csmclName,
        regularEmail: user.regularEmail
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration'
    });
  }
});

// Login endpoint
router.post('/login', authController.login);

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

    const user = await User.findOne({ regularEmail: email.toLowerCase() });
    
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
    user.verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send new verification email
    try {
      await emailAccountService.sendVerificationEmail(user);
      res.json({
        status: 'success',
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error sending verification email'
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while resending verification email'
    });
  }
});

// Check user creation status
router.get('/status/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check if user exists in MongoDB
    const user = await User.findOne({ csmclName: username });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check system user status
    const systemUserExists = await emailAccountService.checkEmailAccount(username);
    
    if (systemUserExists) {
      res.json({
        status: 'completed',
        message: 'User creation completed'
      });
    } else {
      res.json({
        status: 'pending',
        message: 'User creation in progress'
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check user status'
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
