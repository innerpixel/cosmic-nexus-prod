import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import notificationService from '../services/notification.service.js';
import storageService from '../services/storage.service.js';
import emailAccountService from '../services/email-account.service.js';
import crypto from 'crypto';

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req, res) => {
  try {
    // Ensure email service is initialized
    await emailAccountService.ensureInitialized();

    console.log('Registration attempt with data:', { 
      ...req.body,
      password: '[REDACTED]' 
    });

    const { displayName, csmclName, regularEmail, simNumber, password } = req.body;

    // Validate required fields
    if (!displayName || !csmclName || !regularEmail || !simNumber || !password) {
      console.error('Missing required fields:', {
        hasDisplayName: !!displayName,
        hasCsmclName: !!csmclName,
        hasRegularEmail: !!regularEmail,
        hasSimNumber: !!simNumber,
        hasPassword: !!password
      });
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Check if user already exists with either email
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({
      $or: [
        { regularEmail },
        { csmclName }
      ]
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.regularEmail === regularEmail ? 'Email taken' : 'CSMCL name taken');
      return res.status(400).json({
        status: 'error',
        message: existingUser.regularEmail === regularEmail 
          ? 'Email already registered' 
          : 'CSMCL name already taken'
      });
    }

    // Check if email account already exists on mail server
    const emailExists = await emailAccountService.checkEmailAccount(csmclName);
    if (emailExists) {
      console.log('Email account already exists on mail server');
      return res.status(400).json({
        status: 'error',
        message: 'CSMCL name already taken on mail server'
      });
    }

    // Create storage folders first
    console.log('Creating user storage folders...');
    await storageService.createUserFolders(csmclName);

    // Create email account
    console.log('Creating email account...');
    const emailAccount = await emailAccountService.createEmailAccount(csmclName, regularEmail);

    // Create new user
    console.log('Creating new user...');
    const user = new User({
      displayName,
      csmclName,
      regularEmail,
      simNumber,
      password,
      cosmicalEmail: emailAccount.email
    });

    // Generate verification tokens
    console.log('Generating verification token...');
    const emailToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      // Save user first
      console.log('Saving user to database...');
      await user.save();
      console.log('User saved successfully');

      // Send verification email
      console.log('Sending verification email...');
      await emailAccountService.sendVerificationEmail(user.regularEmail, emailToken);
      console.log('Verification email sent successfully');
    } catch (error) {
      // If anything fails after creating resources, clean up
      console.error('Error in final steps:', error);
      await Promise.allSettled([
        storageService.deleteUserFolders(csmclName),
        emailAccountService.deleteEmailAccount(csmclName)
      ]);
      throw error;
    }

    // Return success response
    return res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email for verification instructions.',
      data: {
        user: {
          _id: user._id,
          displayName: user.displayName,
          csmclName: user.csmclName,
          regularEmail: user.regularEmail,
          cosmicalEmail: user.cosmicalEmail
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })));
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while registering',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by either regular email or cosmical email
    const user = await User.findOne({
      $or: [
        { regularEmail: email.toLowerCase() },
        { cosmicalEmail: email.toLowerCase() }
      ]
    }).select('+password'); // Include password field

    if (!user) {
      console.error('User not found:', { email });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified
    if (!user.isEmailVerified || !user.isSimVerified) {
      console.error('User not verified:', { 
        email, 
        isEmailVerified: user.isEmailVerified, 
        isSimVerified: user.isSimVerified 
      });
      return res.status(401).json({
        status: 'error',
        message: 'Please verify your email and phone number before logging in',
        verificationStatus: {
          email: user.isEmailVerified,
          sim: user.isSimVerified
        }
      });
    }

    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      console.error('Invalid password:', { email });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return success response
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          displayName: user.displayName,
          csmclName: user.csmclName,
          regularEmail: user.regularEmail,
          cosmicalEmail: user.cosmicalEmail,
          isEmailVerified: user.isEmailVerified,
          isSimVerified: user.isSimVerified,
          mailAccountCreated: user.mailAccountCreated,
          homeDirCreated: user.homeDirCreated
        },
        accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while logging in'
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.error('Invalid or expired verification token:', { token });
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // If both email and phone are verified, create system accounts
    if (user.isSimVerified) {
      // Create mail account on cosmical.me
      if (!user.mailAccountCreated) {
        await emailAccountService.createMailAccount({
          username: user.csmclName,
          password: crypto.randomBytes(16).toString('hex') // Generate secure password
        });
        user.mailAccountCreated = true;
      }

      // Create home directory on csmcl.space
      if (!user.homeDirCreated) {
        await storageService.createUserHomeDir({
          username: user.csmclName
        });
        user.homeDirCreated = true;
      }
    }

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
      data: {
        user: {
          _id: user._id,
          displayName: user.displayName,
          csmclName: user.csmclName,
          regularEmail: user.regularEmail,
          isEmailVerified: user.isEmailVerified,
          isSimVerified: user.isSimVerified,
          mailAccountCreated: user.mailAccountCreated,
          homeDirCreated: user.homeDirCreated
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while verifying email'
    });
  }
};

// Verify phone
export const verifyPhone = async (req, res) => {
  try {
    const { simNumber, code } = req.body;

    const user = await User.findOne({
      simNumber,
      simVerificationCode: code,
      simVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.error('Invalid or expired verification code:', { simNumber, code });
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification code'
      });
    }

    user.isSimVerified = true;
    user.simVerificationCode = undefined;
    user.simVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while verifying phone number'
    });
  }
};

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.error('No account found with that email:', { email });
      return res.status(404).json({
        status: 'error',
        message: 'No account found with that email'
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    await notificationService.sendPasswordResetEmail(email, resetToken);

    res.json({
      status: 'success',
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.error('Invalid or expired password reset token:', { token });
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      console.error('No refresh token provided');
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      console.error('Invalid refresh token:', { refreshToken });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error('User not found:', { userId: decoded.userId });
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Set new refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return new access token
    return res.status(200).json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while refreshing token'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while logging out'
    });
  }
};
