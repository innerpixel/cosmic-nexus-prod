import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';

class NotificationService {
  constructor() {
    console.log('Initializing email configuration with:', {
      host: mailConfig.smtp.host,
      port: mailConfig.smtp.port,
      user: mailConfig.smtp.auth.user,
      from: mailConfig.from
    });

    this.transporter = nodemailer.createTransport(mailConfig.smtp);

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email configuration error:', error);
      } else {
        console.log('Mail server is ready to take messages');
      }
    });
  }

  async sendVerificationEmail({ to, token }) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: mailConfig.from,
      to: to,
      subject: 'Verify Your Email - Cosmic Nexus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Cosmic Nexus!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: mailConfig.from,
      to: email,
      subject: 'Reset Your Password - Cosmic Nexus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, displayName) {
    console.log('Attempting to send welcome email to:', email);
    const mailOptions = {
      from: mailConfig.from,
      to: email,
      subject: 'Welcome to Cosmic Nexus!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Your Cosmic Journey, ${displayName}!</h2>
          <p>Thank you for joining Cosmic Nexus. Your account has been successfully created and verified.</p>
          <p>Here's what you get with your new account:</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0; padding-left: 24px; position: relative;">
              Your unique @cosmical.me email address
            </li>
            <li style="margin: 10px 0; padding-left: 24px; position: relative;">
              10,000,000 CSMCL tokens
            </li>
            <li style="margin: 10px 0; padding-left: 24px; position: relative;">
              Exclusive NFT minting capability
            </li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Visit Your Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 0.875rem;">
            Need help? Contact our support team at support@cosmical.me
          </p>
        </div>
      `
    };

    try {
      console.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }
}

export default new NotificationService();
