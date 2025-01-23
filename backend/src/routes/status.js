import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { version, commit } from '../version.js';
import User from '../models/user.model.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
    const status = {
        database: {
            status: mongoose.connection.readyState === 1 ? 'ok' : 'error'
        },
        mail: {
            status: 'checking...'
        }
    };

    // Check mail server
    try {
        const transporter = nodemailer.createTransport({
            host: 'localhost',
            port: 25,
            secure: false
        });
        await transporter.verify();
        status.mail.status = 'ok';
    } catch (error) {
        console.error('Mail server check failed:', error);
        status.mail.status = 'error';
    }

    res.json(status);
});

// Version endpoint
router.get('/version', (req, res) => {
    res.json({ version, commit });
});

// Users stats endpoint
router.get('/users/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
        const activeUsers = await User.countDocuments({ isExpired: false });
        const systemUsers = await User.countDocuments({ linuxUserCreated: true });
        
        res.json({
            total: totalUsers,
            verified: verifiedUsers,
            active: activeUsers,
            systemUsers: systemUsers,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ error: 'Failed to get user statistics' });
    }
});

export default router;
