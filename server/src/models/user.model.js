import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
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
    match: [/^[a-z0-9-_]+$/, 'CSMCL name can only contain lowercase letters, numbers, hyphens, and underscores']
  },
  cosmicalEmail: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  regularEmail: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address']
  },
  simNumber: {
    type: String,
    required: [true, 'SIM number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v); // International phone number format
      },
      message: 'Please enter a valid phone number'
    }
  },
  isSimVerified: {
    type: Boolean,
    default: false
  },
  simVerificationCode: {
    type: String,
    default: undefined
  },
  simVerificationExpires: {
    type: Date,
    default: undefined
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(v) {
        if (this.isTest) return true;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  homeDirCreated: {
    type: Boolean,
    default: false
  },
  mailAccountCreated: {
    type: Boolean,
    default: false
  },
  termsAccepted: {
    type: Boolean,
    required: [true, 'Terms acceptance is required'],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'You must accept the Terms of Service and Privacy Policy to register'
    }
  },
  lastLogin: Date,
  isTest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate cosmical.me email
userSchema.pre('save', function(next) {
  if (this.isNew && this.csmclName) {
    this.cosmicalEmail = `${this.csmclName}@cosmical.me`;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    // Skip validation for test users in non-production environment
    if (process.env.NODE_ENV !== 'production' && this.isTest) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.validatePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password validation error:', error);
    return false;
  }
};

const User = mongoose.model('User', userSchema);

export default User;
