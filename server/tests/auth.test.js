import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import jwt from 'jsonwebtoken';

// Mock the notification service
vi.mock('../src/services/notification.service.js', () => ({
  default: {
    sendVerificationEmail: vi.fn(),
    sendSmsVerification: vi.fn()
  }
}));

// Import after mock to ensure proper mocking
import notificationService from '../src/services/notification.service.js';

// Test user data
const validUser = {
  email: 'test@example.com',
  password: 'Test123!@#',  // Meets complexity requirements
  displayName: 'Test User',
  terms: true,
  isTest: true
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
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.displayName).toBe(validUser.displayName);
      expect(res.body.data.user.isEmailVerified).toBe(false);
      expect(res.body.data.token).toBeDefined();

      // Verify user was saved
      const savedUser = await User.findOne({ email: validUser.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.emailVerificationToken).toBeDefined();
      expect(savedUser.emailVerificationExpires).toBeDefined();
    });

    it('should not register user without terms acceptance', async () => {
      const userWithoutTerms = { ...validUser, terms: false };
      const res = await request(app)
        .post('/api/auth/register')
        .send(userWithoutTerms);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Terms must be accepted');
    });

    it('should not register user with existing email', async () => {
      // First create a user
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      // Try to register the same user again
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          password: 'NewTest123!@#'  // Different password but same email
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    let verificationToken;
    let userId;

    beforeEach(async () => {
      // Create a new user
      const user = new User({
        ...validUser,
        isEmailVerified: false
      });
      await user.save();
      userId = user._id;

      // Generate verification token
      verificationToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '24h' }
      );

      // Save token to user
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
    });

    it('should verify email with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      const user = await User.findById(userId);
      expect(user.isEmailVerified).toBe(true);
      expect(user.emailVerificationToken).toBeUndefined();
      expect(user.emailVerificationExpires).toBeUndefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create verified user
      const user = new User({
        ...validUser,
        isEmailVerified: true
      });
      await user.save();
    });

    it('should login verified user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', validUser.email);
      expect(res.body.data.user).toHaveProperty('displayName', validUser.displayName);
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPass123!@#'
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
