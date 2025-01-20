import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import notificationService from '../services/notification.service.js';

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req, res) => {
  try {
    const {
      displayName,
      cosmicalName,
      backupEmail,
      phone,
      password
    } = req.body;

    // Validate cosmicalName format
    if (!/^[a-z0-9]+$/.test(cosmicalName)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cosmical name can only contain lowercase letters and numbers'
      });
    }

    // Check if cosmicalName is available
    const existingCosmicalName = await User.findOne({ cosmicalName });
    if (existingCosmicalName) {
      return res.status(400).json({
        status: 'error',
        message: 'This cosmical name is already taken'
      });
    }

    // Check if phone is already registered
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        status: 'error',
        message: 'This phone number is already registered'
      });
    }

    // Check if backup email is already used
    const existingBackupEmail = await User.findOne({ backupEmail });
    if (existingBackupEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'This backup email is already registered'
      });
    }

    // Create cosmical.me email
    const email = `${cosmicalName}@cosmical.me`;

    // Create new user
    const user = new User({
      displayName,
      cosmicalName,
      email,
      backupEmail,
      phone,
      password
    });

    // Generate verification tokens
    const emailToken = user.generateEmailVerificationToken();
    const phoneCode = user.generatePhoneVerificationCode();

    // Save user
    await user.save();

    // Send verification emails and SMS
    await Promise.all([
      notificationService.sendVerificationEmail(email, emailToken),
      notificationService.sendSmsVerification(phone, phoneCode)
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email and phone for verification.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
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

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email before logging in'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user._id);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          tokenBalance: user.tokenBalance,
          nftMinted: user.nftMinted
        },
        tokens
      }
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
