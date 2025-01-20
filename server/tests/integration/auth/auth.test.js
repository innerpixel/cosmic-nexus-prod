import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../../src/models/user.model.js';
import app from '../../../src/app.js';

// Mock the notification service
vi.mock('../../../src/services/notification.service.js', () => ({
  default: {
    sendVerificationEmail: vi.fn(),
    sendSmsVerification: vi.fn()
  }
}));

// Import after mock to ensure proper mocking
import notificationService from '../../../src/services/notification.service.js';

// Test user data
const validUser = {
  email: 'test@example.com',
  password: 'ValidPass123!',
  displayName: 'Test User',
  termsAccepted: true,
  isTest: true
};

const invalidUser = {
  email: 'invalid-email',
  password: 'weak',
  displayName: 'T',
  termsAccepted: false
};

describe('Authentication API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.displayName).toBe(validUser.displayName);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should not register user without terms acceptance', async () => {
      const userWithoutTerms = { ...validUser, termsAccepted: false };
      const res = await request(app)
        .post('/api/auth/register')
        .send(userWithoutTerms);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('You must accept the Terms of Service and Privacy Policy to register');
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Email already exists');
    });

    it('should not register user with invalid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      // Register a user first
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      const user = await User.findOne({ email: validUser.email });
      const verificationToken = user.emailVerificationToken;

      const verifyRes = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.status).toBe('success');
      expect(verifyRes.body.message).toBe('Email verified successfully');

      // Check if user is verified in database
      const verifiedUser = await User.findById(user._id);
      expect(verifiedUser.isEmailVerified).toBe(true);
      expect(verifiedUser.emailVerificationToken).toBeUndefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before login tests
      await request(app)
        .post('/api/auth/register')
        .send(validUser);
    });

    it('should login verified user with correct credentials', async () => {
      // Verify the user first
      const user = await User.findOne({ email: validUser.email });
      user.isEmailVerified = true;
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
