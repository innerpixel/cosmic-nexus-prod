export const mailConfig = {
  // SMTP Configuration
  smtp: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'mail.cosmical.me',
    port: parseInt(process.env.MAIL_PORT) || (process.env.NODE_ENV === 'development' ? 1025 : 25),
    secure: false, // Use TLS in production
    auth: process.env.NODE_ENV === 'development' ? null : {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    },
    ignoreTLS: process.env.NODE_ENV === 'development',
    tls: {
      rejectUnauthorized: false
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  },

  // Mail domain configuration
  domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'cosmical.me',
  
  // Development settings
  development: {
    prefix: process.env.DEV_PREFIX || 'dev-',
    quotaMB: parseInt(process.env.DEV_QUOTA_MB) || 100
  }
};

// Log configuration
const { host, port, secure } = mailConfig.smtp;
const mode = process.env.NODE_ENV || 'production';
console.log(`Email service running in ${mode} mode using ${host}:${port} (secure: ${secure})`);
