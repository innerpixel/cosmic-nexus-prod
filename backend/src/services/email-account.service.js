import axios from 'axios';
import crypto from 'crypto';
import { mailConfig } from '../config/mail.config.js';
import nodemailer from 'nodemailer';

class EmailAccountService {
  constructor() {
    this.initialized = false;
    this.initializationPromise = this.initialize();
  }

  async initialize() {
    try {
      // Initialize email configuration
      const emailConfig = {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT) || 587,
        user: process.env.MAIL_USER,
        from: process.env.MAIL_FROM,
        domain: process.env.MAIL_DOMAIN || 'cosmical.me'
      };

      console.log('Initializing email configuration with:', {
        host: emailConfig.host,
        port: emailConfig.port,
        user: emailConfig.user,
        from: emailConfig.from,
        domain: emailConfig.domain
      });

      // In development mode, we'll use ethereal.email for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 ETHEREAL EMAIL TESTING SETUP');
        console.log('================================');
        console.log('Development mode detected, using ethereal.email for testing');
        
        const testAccount = await nodemailer.createTestAccount();
        emailConfig.host = testAccount.smtp.host;
        emailConfig.port = testAccount.smtp.port;
        emailConfig.user = testAccount.user;
        emailConfig.pass = testAccount.pass;
        
        console.log('\n🔐 ETHEREAL LOGIN CREDENTIALS');
        console.log('================================');
        console.log('Email:', testAccount.user);
        console.log('Password:', testAccount.pass);
        console.log('\n🌐 ACCESS EMAILS');
        console.log('================================');
        console.log('1. Go to: https://ethereal.email/messages');
        console.log('2. Login with the credentials above');
        console.log('3. You will see all sent emails there\n');

        // Create transporter with Ethereal credentials
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      } else {
        // Create transporter with production credentials
        this.transporter = nodemailer.createTransport({
          host: emailConfig.host,
          port: emailConfig.port,
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
          }
        });
      }

      // Use environment-specific mail domain
      this.mailDomain = emailConfig.domain;
      this.apiEndpoint = mailConfig.api.endpoint;
      this.adminUser = mailConfig.api.adminUser;
      this.adminPassword = mailConfig.api.adminPassword;
      
      // Development environment handling
      this.isDevelopment = process.env.NODE_ENV === 'development';
      this.accountPrefix = this.isDevelopment ? mailConfig.development.prefix : '';

      // Configure axios for mail API
      this.api = axios.create({
        baseURL: this.apiEndpoint,
        auth: {
          username: this.adminUser,
          password: this.adminPassword
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initializationPromise;
    }
  }

  generateSecurePassword() {
    return crypto.randomBytes(16).toString('hex');
  }

  async createEmailAccount(csmclName, forwardTo) {
    await this.ensureInitialized();
    
    // In development mode, just return a mock email account
    if (this.isDevelopment) {
      console.log('Development mode: Creating mock email account');
      return {
        email: `${this.accountPrefix}${csmclName}@${this.mailDomain}`,
        password: 'mock-password',
        created: true
      };
    }
    
    const username = this.accountPrefix + csmclName;
    const password = this.generateSecurePassword();
    
    console.log(`Creating email account: ${username}@${this.mailDomain}`);
    console.log('API Request:', {
      url: '/mail/account',
      method: 'POST',
      data: { username, password, forwardTo }
    });
    
    try {
      const response = await this.api.post('/mail/account', {
        username,
        password,
        forwardTo
      });

      console.log('API Response:', {
        status: response.status,
        data: response.data
      });

      return {
        email: `${username}@${this.mailDomain}`,
        password,
        created: true
      };
    } catch (error) {
      console.error('Failed to create email account:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async deleteEmailAccount(csmclName) {
    await this.ensureInitialized();
    
    const username = this.accountPrefix + csmclName;

    console.log(`Deleting email account: ${username}@${this.mailDomain}`);
    console.log('API Request:', {
      url: `/mail/account/${username}`,  
      method: 'DELETE'
    });

    try {
      const response = await this.api.delete(`/mail/account/${username}`);

      console.log('API Response:', {
        status: response.status,
        data: response.data
      });

      return true;
    } catch (error) {
      console.error('Failed to delete email account:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error('Failed to delete email account: ' + (error.response?.data || error.message));
    }
  }

  async checkEmailAccount(csmclName) {
    await this.ensureInitialized();
    
    // In development mode, always return false (account doesn't exist)
    if (this.isDevelopment) {
      console.log('Development mode: Skipping mail server check');
      return false;
    }
    
    const username = this.accountPrefix + csmclName;
    
    console.log(`Checking if email account exists: ${username}@${this.mailDomain}`);
    console.log('API Request:', {
      url: `/mail/account/${username}`,  
      method: 'GET'
    });
    
    try {
      const response = await this.api.get(`/mail/account/${username}`);

      console.log('API Response:', {
        status: response.status,
        data: response.data
      });

      return response.data.exists;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      console.error('Failed to check email account:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async sendEmail(to, subject, text) {
    await this.ensureInitialized();
    
    try {
      const info = await this.transporter.sendMail({
        from: this.mailDomain,
        to,
        subject,
        text
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent! Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendVerificationEmail(to, token) {
    await this.ensureInitialized();
    
    console.log('Sending verification email to:', to);
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
    const verificationToken = `Verification token: ${token}`;
    
    const mailOptions = {
      from: `"Cosmic Nexus" <noreply@${this.mailDomain}>`,
      to: to,
      subject: 'Verify Your Email - Cosmic Nexus',
      text: `Welcome to Cosmic Nexus!\n\n` +
            `Please verify your email by clicking the link below:\n\n` +
            `${verificationUrl}\n\n` +
            `If you did not request this, please ignore this email.\n\n` +
            `${verificationToken}\n\n` +
            `Best regards,\n` +
            `The Cosmic Nexus Team`,
      html: `
        <h2>Welcome to Cosmic Nexus!</h2>
        <p>Please verify your email by clicking the button below:</p>
        <div style="margin: 20px 0;">
          <a href="${verificationUrl}" style="
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
          ">Verify Email</a>
        </div>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>If you did not request this, please ignore this email.</p>
        <p style="font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 4px;">${verificationToken}</p>
        <br>
        <p>Best regards,<br>The Cosmic Nexus Team</p>
      `
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      if (this.isDevelopment) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }
}

export default new EmailAccountService();
