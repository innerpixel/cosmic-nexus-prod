import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import notificationService from '../services/notification.service.js';
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
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req, res) => {
  try {
    const { displayName, csmclName, regularEmail, simNumber, password, termsAccepted } = req.body;

    // Check if user already exists with either email
    const existingUser = await User.findOne({
      $or: [
        { regularEmail },
        { csmclName }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: existingUser.regularEmail === regularEmail 
          ? 'Email already registered' 
          : 'CSMCL name already taken'
      });
    }

    // Create new user
    const user = new User({
      displayName,
      csmclName,
      regularEmail,
      simNumber,
      password,
      termsAccepted
    });

    // Generate verification tokens
    const emailToken = crypto.randomBytes(32).toString('hex');
    const simCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    user.simVerificationCode = simCode;
    user.simVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send verification email
    await notificationService.sendVerificationEmail({
      to: user.regularEmail,
      token: emailToken
    });

    // Send SMS verification
    await notificationService.sendVerificationSMS({
      to: user.simNumber,
      code: simCode
    });

    // Return success response
    return res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please verify your email and phone number.',
      data: {
        user: {
          _id: user._id,
          displayName: user.displayName,
          csmclName: user.csmclName,
          regularEmail: user.regularEmail
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while registering'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Validate password first
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Then check if user is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email before logging in'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return success response
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
          isEmailVerified: user.isEmailVerified
        },
        accessToken,
        refreshToken
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
        await notificationService.createMailAccount({
          username: user.csmclName,
          password: crypto.randomBytes(16).toString('hex') // Generate secure password
        });
        user.mailAccountCreated = true;
      }

      // Create home directory on csmcl.space
      if (!user.homeDirCreated) {
        await notificationService.createUserHomeDir({
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
