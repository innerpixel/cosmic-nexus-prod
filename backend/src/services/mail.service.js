import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'localhost',
      port: parseInt(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: process.env.MAIL_REJECT_UNAUTHORIZED !== 'false'
      },
      debug: process.env.MAIL_DEBUG === 'true',
      logger: process.env.MAIL_DEBUG === 'true'
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Mail service error:', error);
        console.error('Mail configuration:', {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          secure: process.env.MAIL_SECURE,
          user: process.env.MAIL_USER,
          rejectUnauthorized: process.env.MAIL_REJECT_UNAUTHORIZED
        });
      } else {
        console.log('Mail server connection successful');
      }
    });
  }

  async sendVerificationEmail(to, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: to,
      subject: 'Verify Your Email - Cosmic Nexus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Cosmic Nexus!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #7e3ff2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account with Cosmic Nexus, please ignore this email.
          </p>
        </div>
      `
    });
  }

  async sendPasswordResetEmail(to, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: to,
      subject: 'Password Reset - Cosmic Nexus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #7e3ff2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `
    });
  }

  async sendWelcomeEmail(to, name) {
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: to,
      subject: 'Welcome to Cosmic Nexus!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${name}!</h2>
          <p>Thank you for joining Cosmic Nexus. We're excited to have you on board!</p>
          <p>Here are some things you can do to get started:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore our features</li>
            <li>Connect with other members</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #7e3ff2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
      `
    });
  }

  async sendExpirationWarningEmail(to, displayName, hoursLeft) {
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@cosmical.me',
      to: to,
      subject: 'Action Required: Complete Your Registration - Cosmic Nexus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${displayName}!</h2>
          <p>Your Cosmic Nexus registration is not yet complete and will expire in ${hoursLeft} hours.</p>
          <p>To complete your registration, you need to:</p>
          <ol>
            <li>Verify your email address (if not already done)</li>
            <li>Verify your phone number</li>
          </ol>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify" 
               style="background-color: #7e3ff2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Registration
            </a>
          </div>
          <p>If you don't complete these steps within ${hoursLeft} hours, your registration will expire and you'll need to register again.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't register for Cosmic Nexus, you can safely ignore this email.
          </p>
        </div>
      `
    });
  }

  async sendExpirationNotificationEmail(to, displayName) {
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@cosmical.me',
      to: to,
      subject: 'Registration Expired - Cosmic Nexus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${displayName},</h2>
          <p>Your Cosmic Nexus registration has expired because the verification process wasn't completed within 48 hours.</p>
          <p>To use Cosmic Nexus, you'll need to register again:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/register" 
               style="background-color: #7e3ff2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Register Again
            </a>
          </div>
          <p>When you register again, make sure to:</p>
          <ol>
            <li>Use a valid email address that you can access</li>
            <li>Complete email verification promptly</li>
            <li>Complete phone verification</li>
          </ol>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't register for Cosmic Nexus, you can safely ignore this email.
          </p>
        </div>
      `
    });
  }
}

export default new MailService();
