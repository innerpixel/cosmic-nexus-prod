import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import emailAccountService from '../services/email-account.service.js';
import storageService from '../services/storage.service.js';
import User from '../models/user.model.js';

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
      password: hashedPassword,
      regularEmail,
      verificationToken,
      verificationExpires,
      isEmailVerified: false
    });
    
    // Save user to database
    await user.save();
    console.log('User saved to MongoDB successfully');
    
    try {
      // Create system user
      await emailAccountService.createEmailAccount(csmclName, password);
      console.log('System user created successfully');
      
      // Try to send verification email, but don't fail if it doesn't work
      try {
        await emailAccountService.sendVerificationEmail(user, verificationToken);
        console.log('Verification email sent');
      } catch (emailError) {
        console.warn('Could not send verification email:', emailError.message);
      }
      
      res.status(201).json({
        status: 'success',
        message: 'Registration successful. Please check your email for verification.',
        verificationToken // Only in development
      });
    } catch (systemError) {
      // If system user creation fails, delete the MongoDB user
      await User.deleteOne({ _id: user._id });
      throw new Error(`Failed to create system user: ${systemError.message}`);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Registration failed',
      details: error.message 
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

    // Create user storage folders after verification
    try {
      await storageService.createUserFolders(user.csmclName);
      console.log(`Storage folders created for user: ${user.csmclName}`);
    } catch (error) {
      console.error(`Failed to create storage for ${user.csmclName}:`, error);
      // Continue with verification success even if storage creation fails
      // We can implement a retry mechanism later
    }

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

    // Create user storage folders after verification
    try {
      await storageService.createUserFolders(user.csmclName);
      console.log(`Storage folders created for user: ${user.csmclName}`);
    } catch (error) {
      console.error(`Failed to create storage for ${user.csmclName}:`, error);
      // Continue with verification success even if storage creation fails
      // We can implement a retry mechanism later
    }

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

    // Send new verification email
    await emailAccountService.sendVerificationEmail(user, verificationToken);
    console.log('New verification email sent');

    res.json({
      status: 'success',
      message: 'New verification token sent. Please check your email.'
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
