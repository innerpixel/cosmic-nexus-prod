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
    const { displayName, csmclName, regularEmail, simNumber, password } = req.body;

    // Validate input
    if (!displayName || !csmclName || !regularEmail || !simNumber || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { regularEmail },
        { csmclName },
        { simNumber }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email, CSMCL name, or SIM number'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      displayName,
      csmclName,
      regularEmail,
      simNumber,
      password: hashedPassword,
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await user.save();

    // Create local Unix user in development mode
    if (process.env.NODE_ENV === 'development') {
      try {
        await emailAccountService.createLocalUser(csmclName, password);
        console.log(`Local Unix user ${csmclName} created successfully`);
      } catch (error) {
        console.error('Failed to create local Unix user:', error);
        // Don't fail registration if local user creation fails
      }
    }

    // Send verification email
    try {
      await emailAccountService.sendVerificationEmail(user, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please check your email for verification.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user'
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

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token is required'
      });
    }

    // Find user with matching token and token not expired
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified and clear verification token
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
      message: 'Failed to verify email'
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

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    // Get email from authenticated user or request body
    const email = req.user?.regularEmail || req.body.email;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    console.log('Attempting to resend verification email to:', email);

    const user = await User.findOne({ regularEmail: email });
    
    if (!user) {
      console.error('User not found for email:', email);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      console.log('Email already verified for:', email);
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const emailToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.save();
    console.log('Generated new verification token for:', email);

    // Send verification email
    await emailAccountService.sendVerificationEmail(user.regularEmail, emailToken, user.displayName);
    console.log('Sent verification email to:', email);

    return res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to resend verification email'
    });
  }
};
