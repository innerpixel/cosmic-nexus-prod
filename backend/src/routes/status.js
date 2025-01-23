const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const version = require('../version');

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
    res.json(version);
});

module.exports = router;
