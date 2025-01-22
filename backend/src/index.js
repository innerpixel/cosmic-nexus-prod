import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import testRoutes from './routes/test.routes.js';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Debug environment
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_FROM: process.env.MAIL_FROM
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
});

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://csmclAdmin:CsmclAdmin2025!@localhost:27017/csmcl?authSource=admin';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});
