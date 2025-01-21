import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import User from '../../../src/models/user.model.js';
import { generateTokens } from '../../../src/services/auth.service.js';

describe('Authentication Service Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    vi.clearAllMocks();
  });

  describe('Token Generation', () => {
    it('should generate access and refresh tokens', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User',
        termsAccepted: true,
        isTest: true
      });
      await user.save();

      const { accessToken, refreshToken } = generateTokens(user._id);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // Verify access token
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET || 'test-jwt-secret');
      expect(decodedAccess.userId).toBe(user._id.toString());

      // Verify refresh token
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET || 'test-jwt-secret');
      expect(decodedRefresh.userId).toBe(user._id.toString());
    });

    it('should generate tokens with correct expiration', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User',
        termsAccepted: true,
        isTest: true
      });
      await user.save();

      const { accessToken, refreshToken } = generateTokens(user._id);

      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET || 'test-jwt-secret');
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET || 'test-jwt-secret');

      // Access token should expire in 15 minutes
      expect(decodedAccess.exp - decodedAccess.iat).toBe(15 * 60);

      // Refresh token should expire in 7 days
      expect(decodedRefresh.exp - decodedRefresh.iat).toBe(7 * 24 * 60 * 60);
    });
  });

  describe('Token Verification', () => {
    it('should verify valid tokens', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User',
        termsAccepted: true,
        isTest: true
      });
      await user.save();

      const { accessToken } = generateTokens(user._id);

      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'test-jwt-secret');
      expect(decoded.userId).toBe(user._id.toString());
    });

    it('should reject expired tokens', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'ValidPass123!',
        displayName: 'Test User',
        termsAccepted: true,
        isTest: true
      });
      await user.save();

      // Generate token that's already expired
      const expiredToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: 0 }
      );

      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET || 'test-jwt-secret');
      }).toThrow(jwt.TokenExpiredError);
    });

    it('should reject invalid tokens', async () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, process.env.JWT_SECRET || 'test-jwt-secret');
      }).toThrow(jwt.JsonWebTokenError);
    });
  });
});
