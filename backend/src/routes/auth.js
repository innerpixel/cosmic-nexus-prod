import express from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { createTestAccount, createTransport } from 'ethereal-email';

const router = express.Router();

// Create Ethereal test account for development
let testAccount = null;
let transporter = null;

async function setupEtherealEmail() {
  if (!testAccount) {
    testAccount = await createTestAccount();
    console.log('Ethereal Email test account:', testAccount);
    
    transporter = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
}

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // In a real app, save user to database here
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword
    };
    
    // Setup Ethereal email
    const emailTransporter = await setupEtherealEmail();
    
    // Send welcome email
    const info = await emailTransporter.sendMail({
      from: '"Cosmic Nexus" <cosmic@nexus.test>',
      to: email,
      subject: 'Welcome to Cosmic Nexus!',
      text: `Welcome ${name}! Thank you for registering with Cosmic Nexus.`,
      html: `<h1>Welcome ${name}!</h1><p>Thank you for registering with Cosmic Nexus.</p>`,
    });
    
    console.log('Welcome email sent:', info);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    res.status(201).json({ 
      message: 'Registration successful',
      user: { id: user.id, email: user.email, name: user.name },
      emailPreview: nodemailer.getTestMessageUrl(info)
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
