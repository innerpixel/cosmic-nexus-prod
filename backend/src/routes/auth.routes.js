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

const router = express.Router();

// Apply rate limiting to auth routes
router.use(rateLimiter);

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerificationEmail);

export default router;
