import express from 'express';
import User from '../models/user.model.js';
import userSystemService from '../services/user-system.service.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    console.log('Checking admin privileges...');
    
    // If running as root/sudo, allow access
    if (process.getuid() === 0) {
      console.log('Running as root - access granted');
      return next();
    }
    
    // Get current user's system groups
    const { stdout } = await execAsync(`groups ${process.env.USER || 'root'}`);
    const groups = stdout.trim().split(' ');
    
    console.log('User groups:', groups);
    
    // Check if user is in sudo/wheel/root group
    const isSystemAdmin = groups.some(group => ['sudo', 'wheel', 'root'].includes(group));
    
    console.log('Is system admin:', isSystemAdmin);
    
    if (!isSystemAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Requires administrative privileges'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify administrative privileges',
      details: error.message
    });
  }
};

// Apply admin check to all routes
router.use(isAdmin);

// List all users
router.get('/users', async (req, res) => {
  console.log('Listing users...');
  try {
    const users = await User.find({}, {
      displayName: 1,
      csmclName: 1,
      regularEmail: 1,
      isEmailVerified: 1,
      createdAt: 1
    });
    
    console.log('Found users:', users);
    
    res.json({
      status: 'success',
      users
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list users',
      details: error.message
    });
  }
});

// Delete user
router.delete('/users/:csmclName', async (req, res) => {
  console.log('Deleting user...');
  try {
    const { csmclName } = req.params;
    
    console.log('Deleting user:', csmclName);
    
    // Find user in database
    const user = await User.findOne({ csmclName });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Try to delete system user if it exists
    try {
      await userSystemService.deleteSystemUser(csmclName);
      console.log('Deleted system user:', csmclName);
    } catch (error) {
      console.warn('System user deletion failed (may not exist):', error.message);
    }
    
    // Delete from MongoDB
    await User.deleteOne({ csmclName });
    console.log('Deleted MongoDB user:', csmclName);
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      details: error.message
    });
  }
});

// Get user details
router.get('/users/:csmclName', async (req, res) => {
  console.log('Getting user details...');
  try {
    const { csmclName } = req.params;
    
    console.log('Getting user details for:', csmclName);
    
    const user = await User.findOne({ csmclName });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get system user details
    const { stdout: homeSize } = await execAsync(`sudo du -sh /home/${csmclName} | cut -f1`);
    const { stdout: groups } = await execAsync(`groups ${csmclName}`);
    
    console.log('User details:', user.toObject());
    console.log('Home size:', homeSize.trim());
    console.log('Groups:', groups.trim().split(' ').slice(2));
    
    res.json({
      status: 'success',
      user: {
        ...user.toObject(),
        systemInfo: {
          homeSize: homeSize.trim(),
          groups: groups.trim().split(' ').slice(2)
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user details',
      details: error.message
    });
  }
});

// Force verify user
router.post('/users/:csmclName/verify', async (req, res) => {
  console.log('Verifying user...');
  try {
    const { csmclName } = req.params;
    
    console.log('Verifying user:', csmclName);
    
    const user = await User.findOne({ csmclName });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();
    
    console.log('User verified:', csmclName);
    
    res.json({
      status: 'success',
      message: `User ${csmclName} verified successfully`
    });
  } catch (error) {
    console.error('Force verify error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify user',
      details: error.message
    });
  }
});

export default router;
