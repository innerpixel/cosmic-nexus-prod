import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { version, commit } from '../version.js';

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

export default router;
