import express from 'express';
import emailService from '../services/email-account.service.js';

const router = express.Router();

router.post('/test-email', async (req, res) => {
  try {
    const info = await emailService.sendWelcomeEmail('ned.gabrielc@gmail.com', 'Ned');
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
