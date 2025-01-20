import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import User from '../src/models/user.model.js';

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
  password: 'ValidPass123!',
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
      expect(res.body.data.user).toHaveProperty('email', validUser.email);
      expect(res.body.data.user).toHaveProperty('displayName', validUser.displayName);
      expect(res.body.data.user).toHaveProperty('isEmailVerified', false);
      expect(res.body.data).toHaveProperty('token');
      expect(notificationService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should not register user without terms acceptance', async () => {
      const userWithoutTerms = { ...validUser, terms: false };
      const res = await request(app)
        .post('/api/auth/register')
        .send(userWithoutTerms);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Terms must be accepted');
    });

    it('should not register user with existing email', async () => {
      // Create user first
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      await User.create({
        ...validUser,
        password: hashedPassword
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email already exists');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      // Create user with verification token
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      await User.create({
        ...validUser,
        password: hashedPassword,
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid-token' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.isEmailVerified).toBe(true);
      expect(res.body.data.user.emailVerificationToken).toBeNull();
    });

    it('should not verify with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid or expired verification token');
    });

    it('should not verify with expired token', async () => {
      // Create user with expired token
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      await User.create({
        ...validUser,
        password: hashedPassword,
        emailVerificationToken: 'expired-token',
        emailVerificationExpires: new Date(Date.now() - 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'expired-token' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid or expired verification token');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create verified user with hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validUser.password, salt);

      // Create user with all required fields
      const user = new User({
        ...validUser,
        password: hashedPassword,
        isEmailVerified: true
      });

      // Save user
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
    });

    it('should not login unverified user', async () => {
      // Update user to be unverified
      await User.findOneAndUpdate(
        { email: validUser.email },
        { isEmailVerified: false }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('verify');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });
});
