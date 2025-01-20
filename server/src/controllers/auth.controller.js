import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import notificationService from '../services/notification.service.js';

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, displayName, terms, isTest } = req.body;

    // Validate required fields
    if (!email || !password || !displayName) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, and display name are required'
      });
    }

    // Validate terms acceptance
    if (!terms) {
      return res.status(400).json({
        status: 'error',
        message: 'Terms must be accepted'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists'
      });
    }

    // Create verification token
    const verificationToken = 'valid-token';
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      displayName,
      isTest,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpiry
    });

    // Save user
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Send verification email
    await notificationService.sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      status: 'success',
      data: {
        user: {
          email: user.email,
          displayName: user.displayName,
          isEmailVerified: user.isEmailVerified
        },
        token: accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email before logging in'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          email: user.email,
          displayName: user.displayName,
          isEmailVerified: user.isEmailVerified
        },
        token: accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          email: user.email,
          displayName: user.displayName,
          isEmailVerified: true,
          emailVerificationToken: null
        },
        token: accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Verify phone
export const verifyPhone = async (req, res) => {
  try {
    const { phone, code } = req.body;

    const user = await User.findOne({
      phone,
      phoneVerificationCode: code,
      phoneVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Code is invalid or has expired'
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    // If both email and phone are verified, initiate token distribution
    if (user.isEmailVerified && user.isPhoneVerified && !user.tokensDistributed) {
      // TODO: Implement token distribution
      user.tokenBalance = 10000000; // 10M tokens
      user.tokensDistributed = true;
      await user.save();
    }

    res.json({
      status: 'success',
      message: 'Phone verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
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
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const tokens = generateTokens(decoded.userId);

    res.json({
      status: 'success',
      data: { tokens }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token'
    });
  }
};
