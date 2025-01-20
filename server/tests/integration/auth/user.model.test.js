import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { User } from '../../../src/models/user.model.js';

describe('User Model Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Validation', () => {
    it('should validate a valid user', async () => {
      const validUser = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User',
        isTest: true
      });

      const savedUser = await validUser.save();
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.displayName).toBe(validUser.displayName);
    });

    it('should fail validation for invalid email format', async () => {
      const userWithInvalidEmail = new User({
        email: 'invalid-email',
        password: 'ValidPass123!',
        displayName: 'Test User'
      });

      await expect(userWithInvalidEmail.save()).rejects.toThrow();
    });

    it('should fail validation for weak password (non-test user)', async () => {
      const userWithWeakPassword = new User({
        email: 'test@example.com',
        password: 'weak',
        displayName: 'Test User',
        isTest: false
      });

      await expect(userWithWeakPassword.save()).rejects.toThrow();
    });

    it('should allow simple password for test user', async () => {
      const testUser = new User({
        email: 'test@example.com',
        password: 'simple123',
        displayName: 'Test User',
        isTest: true
      });

      const savedUser = await testUser.save();
      expect(savedUser._id).toBeDefined();
    });

    it('should fail validation for invalid display name characters', async () => {
      const userWithInvalidDisplayName = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User @#$'
      });

      await expect(userWithInvalidDisplayName.save()).rejects.toThrow();
    });

    it('should fail validation for display name length < 3', async () => {
      const userWithShortDisplayName = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Ab'
      });

      await expect(userWithShortDisplayName.save()).rejects.toThrow();
    });

    it('should fail validation for display name length > 50', async () => {
      const userWithLongDisplayName = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'A'.repeat(51)
      });

      await expect(userWithLongDisplayName.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const password = 'ValidPass123!';
      const user = new User({
        email: 'test@example.com',
        password,
        displayName: 'Test User',
        isTest: true
      });

      const savedUser = await user.save();
      expect(savedUser.password).not.toBe(password);
      expect(savedUser.password).toBeDefined();
    });

    it('should validate password correctly', async () => {
      const password = 'ValidPass123!';
      const user = new User({
        email: 'test@example.com',
        password,
        displayName: 'Test User',
        isTest: true
      });

      await user.save();
      const isValid = await user.validatePassword(password);
      expect(isValid).toBe(true);
    });

    it('should not validate incorrect password', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User',
        isTest: true
      });

      await user.save();
      const isValid = await user.validatePassword('WrongPass123!');
      expect(isValid).toBe(false);
    });
  });

  describe('Email Verification', () => {
    it('should initialize with email unverified', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User',
        isTest: true
      });

      const savedUser = await user.save();
      expect(savedUser.isEmailVerified).toBe(false);
    });

    it('should store verification token and expiry', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User',
        isTest: true
      });

      user.emailVerificationToken = 'test-token';
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const savedUser = await user.save();
      expect(savedUser.emailVerificationToken).toBe('test-token');
      expect(savedUser.emailVerificationExpires).toBeDefined();
    });
  });
});
