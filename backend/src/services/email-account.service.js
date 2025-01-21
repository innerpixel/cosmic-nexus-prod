import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';

class EmailAccountService {
  constructor() {
    this.initialized = false;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Create transporter with config
    this.transporter = nodemailer.createTransport(mailConfig.smtp);
  }

  async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      await this.transporter.verify();
      console.log('Mail server connection verified');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize mail server connection:', error);
      throw error;
    }
  }

  async createEmailAccount(username, forwardTo) {
    const email = `${username}@${mailConfig.domain}`;
    
    try {
      if (this.isDevelopment) {
        console.log(`[DEV] Creating local email account: ${email}`);
        // In development, we assume the local mail server handles account creation
        return { email, username, forwardTo };
      }
      
      // Production: implement actual email account creation on cosmical.me
      throw new Error('Production email account creation not implemented');
    } catch (error) {
      console.error('Failed to create email account:', error);
      throw error;
    }
  }

  async deleteEmailAccount(username) {
    const email = `${username}@${mailConfig.domain}`;
    
    try {
      if (this.isDevelopment) {
        console.log(`[DEV] Deleting local email account: ${email}`);
        // In development, we assume the local mail server handles deletion
        return true;
      }
      
      // Production: implement actual email account deletion on cosmical.me
      throw new Error('Production email account deletion not implemented');
    } catch (error) {
      console.error('Failed to delete email account:', error);
      throw error;
    }
  }

  async checkEmailAccount(username) {
    const email = `${username}@${mailConfig.domain}`;
    
    try {
      if (this.isDevelopment) {
        console.log(`[DEV] Checking local email account: ${email}`);
        // In development, we assume no accounts exist
        return false;
      }
      
      // Production: implement actual email account check on cosmical.me
      throw new Error('Production email account check not implemented');
    } catch (error) {
      console.error('Failed to check email account:', error);
      throw error;
    }
  }

  async sendVerificationEmail(to, token, name) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
    
    const mailOptions = {
      from: process.env.MAIL_FROM || `noreply@${mailConfig.domain}`,
      to: to,
      subject: 'Verify Your Email - Cosmic Nexus',
      text: `Hello ${name}!

Please verify your email address by clicking the link below:

${verifyUrl}

If you did not create an account, please ignore this email.

Best regards,
The Cosmic Nexus Team`,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Hello ${name}!</h2>
  
  <p>Please verify your email address by clicking the button below:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Verify Email Address
    </a>
  </div>
  
  <p>If the button doesn't work, you can also click this link:</p>
  <p><a href="${verifyUrl}">${verifyUrl}</a></p>
  
  <p>If you did not create an account, please ignore this email.</p>
  
  <p>Best regards,<br>The Cosmic Nexus Team</p>
</div>`
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to, name) {
    const mailOptions = {
      from: process.env.MAIL_FROM || `noreply@${mailConfig.domain}`,
      to: to,
      subject: 'Welcome to Cosmic Nexus!',
      text: `Welcome ${name}! Your account has been created successfully.`
    };
    
    try {
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
