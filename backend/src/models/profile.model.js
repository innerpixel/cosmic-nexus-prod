import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  avatar: {
    type: String
  },
  links: [{
    platform: {
      type: String,
      enum: ['github', 'linkedin', 'twitter', 'website', 'other']
    },
    url: String
  }],
  skills: [{
    type: String,
    trim: true
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
