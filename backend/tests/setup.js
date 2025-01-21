import { beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Set test environment
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.MAIL_HOST = 'smtp.cosmical.me';
process.env.MAIL_PORT = '587';
process.env.MAIL_USER = 'test@cosmical.me';
process.env.MAIL_PASSWORD = 'test-password';
process.env.FRONTEND_URL = 'https://csmcl.space';
