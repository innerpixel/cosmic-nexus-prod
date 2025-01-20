import nodemailer from 'nodemailer';

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your CSMCL-SPACE Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Welcome to CSMCL-SPACE!</h2>
          <p>Thank you for joining our cosmic community. To complete your registration, please verify your email address.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #4f46e5;">${verificationUrl}</p>
          <p>This verification link will expire in ${process.env.EMAIL_TOKEN_EXPIRY}.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 0.875rem;">
            If you didn't create an account with CSMCL-SPACE, you can safely ignore this email.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your CSMCL-SPACE Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>We received a request to reset your CSMCL-SPACE password. Click the button below to choose a new password.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #4f46e5;">${resetUrl}</p>
          <p>This password reset link will expire in ${process.env.EMAIL_TOKEN_EXPIRY}.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 0.875rem;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email, displayName) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to CSMCL-SPACE!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Welcome to Your Cosmic Journey, ${displayName}!</h2>
          <p>Thank you for joining CSMCL-SPACE. Your account has been successfully created and verified.</p>
          <p>Here's what you get with your new account:</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0; padding-left: 24px; position: relative;">
              ✨ Your unique @cosmical.me email address
            </li>
            <li style="margin: 10px 0; padding-left: 24px; position: relative;">
              💎 10,000,000 CSMCL tokens
            </li>
            <li style="margin: 10px 0; padding-left: 24px; position: relative;">
              🎨 Exclusive NFT minting capability
            </li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
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
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
}

export default new NotificationService();
