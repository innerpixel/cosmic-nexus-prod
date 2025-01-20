import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password in queries by default
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isTest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
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
