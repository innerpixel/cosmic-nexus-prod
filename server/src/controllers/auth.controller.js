import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import mailService from '../services/mail.service.js';
import { createError } from '../utils/error.js';

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(400, 'Email already in use'));
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      displayName
    });

    // Generate verification token
    const verificationToken = user.createVerificationToken();
    await user.save();

    // Send verification email
    await mailService.sendVerificationEmail(user.email, verificationToken);

    // Create token
    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(createError(400, 'Please provide email and password'));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(createError(401, 'Incorrect email or password'));
    }

    // Create token
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(createError(400, 'Token is invalid or has expired'));
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send welcome email
    await mailService.sendWelcomeEmail(user.email, user.displayName);

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, 'No user found with that email'));
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // Send password reset email
    await mailService.sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email'
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(createError(400, 'Token is invalid or has expired'));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Create new token
    const newToken = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token: newToken
    });
  } catch (err) {
    next(err);
  }
};
