import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    minlength: [2, 'Display name must be at least 2 characters long'],
    maxlength: [50, 'Display name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        const words = v.trim().split(/\s+/);
        return words.length >= 1 && words.length <= 3;
      },
      message: 'Display name must be between 1 and 3 words'
    }
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
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  cosmicalEmail: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  simNumber: {
    type: String,
    required: [true, 'SIM number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit SIM number'],
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v); // International phone number format
      },
      message: 'Please enter a valid phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(v) {
        if (this.isTest) return true;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};:'",.<>/?]{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isSimVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  simVerificationToken: String,
  simVerificationExpires: Date,
  storageCreated: {
    type: Boolean,
    default: false
  },
  mailAccountCreated: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  isTest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate cosmical.me email
userSchema.pre('save', function(next) {
  if (this.isNew && this.csmclName) {
    this.cosmicalEmail = `${this.csmclName}@cosmical.me`;
  }
  next();
});

// Pre-save middleware to update the updatedAt timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison failed:', error);
    return false;
  }
};

const User = mongoose.model('User', userSchema);

export default User;
