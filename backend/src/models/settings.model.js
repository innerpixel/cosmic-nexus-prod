import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  storage: {
    quota: {
      type: Number,
      default: 5368709120  // 5GB in bytes
    },
    used: {
      type: Number,
      default: 0
    }
  },
  email: {
    forwardingEnabled: {
      type: Boolean,
      default: false
    },
    forwardingAddress: {
      type: String,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    spamFilter: {
      type: Boolean,
      default: true
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    lastPasswordChange: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
