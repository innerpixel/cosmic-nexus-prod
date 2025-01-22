import nodemailer from 'nodemailer';
import userSystemService from './user-system.service.js';

class EmailAccountService {
  constructor() {
    this.initialized = false;
  }

  async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      // Create transporter with config
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD
        }
      });
      
      // Verify connection
      await this.transporter.verify();
      console.log('Mail server connection verified');
      this.initialized = true;
      
      // Log mail configuration
      console.log('Initializing email configuration with:', {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        from: process.env.MAIL_FROM
      });
    } catch (error) {
      console.error('Email configuration error:', error);
      throw error;
    }
  }

  async checkEmailAccount(username) {
    return await userSystemService.checkSystemUser(username);
  }

  async createEmailAccount(username, password) {
    return await userSystemService.createSystemUser(username, password);
  }

  async deleteEmailAccount(username) {
    return await userSystemService.deleteSystemUser(username);
  }

  async sendVerificationEmail(user, verificationToken) {
    try {
      await this.ensureInitialized();
      
      const message = {
        from: `CSMCL <${process.env.MAIL_FROM || 'noreply@local.test'}>`,
        to: user.regularEmail,
        subject: 'Verify your CSMCL account',
        text: `Hello ${user.displayName},\n\nYour email verification token is:\n\n${verificationToken}\n\nPlease enter this token in the verification form to verify your email address.\n\nIf you did not request this verification, please ignore this email.\n\nBest regards,\nCSMCL Team`,
        html: `
          <h2>Hello ${user.displayName},</h2>
          <p>Your email verification token is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 16px;">
            ${verificationToken}
          </div>
          <p>Please enter this token in the verification form to verify your email address.</p>
          <p>If you did not request this verification, please ignore this email.</p>
          <br>
          <p>Best regards,<br>CSMCL Team</p>
        `
      };

      const info = await this.transporter.sendMail(message);
      console.log('Verification email sent:', info.messageId);
      
      // If we're in development mode using Ethereal, log the preview URL
      // const previewUrl = nodemailer.getTestMessageUrl(info);
      // console.log('Preview URL:', previewUrl);
      console.log('Verification token:', verificationToken);  // Log the token for easy testing

      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to, name) {
    const mailOptions = {
      from: process.env.MAIL_FROM || `noreply@${process.env.MAIL_HOST}`,
      to: to,
      subject: 'Welcome to Cosmic Nexus!',
      text: `Welcome ${name}! Your account has been created successfully.`
    };
    
    try {
      await this.ensureInitialized();
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
}

export default new EmailAccountService();
