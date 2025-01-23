import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';

dotenv.config({ path: '.env.development' });

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/csmcl');
    const user = await User.findOne({ csmclName: 'testuserdev2' });
    if (!user) {
      console.log('User not found in database');
      return;
    }
    console.log('User:', {
      displayName: user.displayName,
      csmclName: user.csmclName,
      verificationToken: user.verificationToken,
      isEmailVerified: user.isEmailVerified
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
