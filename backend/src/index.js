import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import statusRoutes from './routes/status.js';

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
app.use(helmet({
  contentSecurityPolicy: false // Disable for development
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
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
app.use('/api', statusRoutes);  // Mount status routes at /api
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/local_dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  
  // Start server after DB connection
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
