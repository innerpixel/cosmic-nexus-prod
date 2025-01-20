import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';

// Mock the mail service
vi.mock('../src/services/mail.service.js', () => ({
  default: {
    sendVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn()
  }
}));

// Import after mock to ensure proper mocking
import mailService from '../src/services/mail.service.js';

describe('Authentication API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'Password123!',
      displayName: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.data.user).toHaveProperty('email', validUser.email);
      expect(res.body.data.user).toHaveProperty('displayName', validUser.displayName);
      expect(res.body).toHaveProperty('token');
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
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
      expect(res.body).toHaveProperty('message', 'Email already in use');
    });

    it('should validate display name format', async () => {
      const invalidUser = {
        ...validUser,
        displayName: 'Test User With Too Many Words',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/display name/i);
    });
  });

  describe('POST /api/auth/login', () => {
    const user = {
      email: 'login@example.com',
      password: 'Password123!',
      displayName: 'Login User',
    };

    beforeEach(async () => {
      // Create a user before each test
      await request(app)
        .post('/api/auth/register')
        .send(user);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: user.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', user.email);
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/incorrect email or password/i);
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: user.password,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/incorrect email or password/i);
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    let verificationToken;
    
    it('should verify email with valid token', async () => {
      // Register a user first
      const user = {
        email: 'verify@example.com',
        password: 'Password123!',
        displayName: 'Verify User',
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(user);

      // Extract the verification token from the sendVerificationEmail mock
      const mockCall = mailService.sendVerificationEmail.mock.calls[0];
      verificationToken = mockCall[1]; // Second argument is the token

      const res = await request(app)
        .get(`/api/auth/verify-email/${verificationToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/email verified/i);

      // Check that the user's email is verified in the database
      const updatedUser = await User.findOne({ email: user.email });
      expect(updatedUser.isEmailVerified).toBe(true);
    });

    it('should not verify with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify-email/invalidtoken');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Token is invalid or has expired');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    const user = {
      email: 'forgot@example.com',
      password: 'Password123!',
      displayName: 'Forgot User',
    };

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(user);
    });

    it('should send reset password email for existing user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: user.email });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reset password email sent/i);
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should not reveal if email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reset password email sent/i);
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });
});
