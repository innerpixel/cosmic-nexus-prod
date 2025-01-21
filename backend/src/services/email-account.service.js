import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'mail.cosmical.me',
  port: parseInt(process.env.MAIL_PORT) || 25,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

const emailService = {
  sendWelcomeEmail: async (to, name) => {
    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@cosmical.me',
      to: to,
      subject: 'Welcome to Cosmic Nexus!',
      text: 'Welcome Ned!'
    };
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
};

export default emailService;
