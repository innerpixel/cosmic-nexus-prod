import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    minlength: [2, 'Display name must be at least 2 characters long'],
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  csmclName: {
    type: String,
    required: [true, 'CSMCL name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'CSMCL name can only contain lowercase letters, numbers, and hyphens'],
    minlength: [3, 'CSMCL name must be at least 3 characters long'],
    maxlength: [30, 'CSMCL name cannot exceed 30 characters']
  },
  regularEmail: {
    type: String,
    required: [true, 'Regular email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  cosmicalEmail: {
    type: String,
    required: [true, 'Cosmical email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  simNumber: {
    type: String,
    required: [true, 'SIM number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isSimVerified: {
    type: Boolean,
    default: false
  },
  hasMailAccount: {
    type: Boolean,
    default: false
  },
  hasHomeDir: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User;
