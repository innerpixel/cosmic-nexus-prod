import express from 'express';
import { 
  register, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  resendVerificationEmail 
} from '../controllers/auth.controller.js';
import { rateLimiter } from '../middleware/rate-limiter.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create email transport for development
async function setupEmailTransport() {
  // In development, use direct SMTP connection
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail'
    });
  }
  
  // Production configuration
  const transport = {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
  };
  
  console.log('Setting up email transport with:', {
    host: transport.host,
    port: transport.port,
    user: transport.auth.user,
    env: process.env.NODE_ENV
  });
  
  return nodemailer.createTransport(transport);
}

// Apply rate limiting to auth routes
router.use(rateLimiter);

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerificationEmail);

export default router;
