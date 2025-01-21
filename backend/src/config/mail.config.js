export const mailConfig = {
  // SMTP Configuration for mail.cosmical.me
  smtp: {
    host: 'mail.cosmical.me',
    port: 25,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  },

  // Mail domain configuration
  domain: process.env.MAIL_DOMAIN || 'cosmical.me',
  
  // Development settings
  development: {
    prefix: process.env.DEV_PREFIX || 'dev-',
    quotaMB: parseInt(process.env.DEV_QUOTA_MB) || 100,
    useTestAccount: process.env.NODE_ENV === 'development'
  }
};

// Override SMTP settings in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode: Mail server will use ethereal.email for testing');
}
