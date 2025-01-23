import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

async function sendTestEmail() {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: 'testuser3@local-dev.test',
      subject: 'Test Email',
      text: 'This is a test email to verify your mailbox is working.',
      html: '<p>This is a test email to verify your mailbox is working.</p>'
    });

    console.log('Message sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendTestEmail();
