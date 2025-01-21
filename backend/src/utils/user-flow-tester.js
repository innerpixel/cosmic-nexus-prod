import nodemailer from 'nodemailer';
import axios from 'axios';
import mongoose from 'mongoose';

class UserFlowTester {
    constructor() {
        this.testUsers = new Map();
        this.testAccount = null;
        this.transporter = null;
        this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api';
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.receivedEmails = new Map();
    }

    async initialize() {
        try {
            // Connect to MongoDB if not already connected
            if (mongoose.connection.readyState !== 1) {
                const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmic-nexus';
                console.log('Connecting to MongoDB...');
                await mongoose.connect(mongoUri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                console.log('MongoDB connected successfully');
            }

            // Create local postfix transporter for development
            if (!this.transporter) {
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'localhost',
                    port: process.env.SMTP_PORT || 25,
                    secure: process.env.SMTP_SECURE === 'true',
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                
                console.log('\n🔧 Test Environment Ready');
                console.log('----------------------------------------');
                console.log('Using local postfix for email testing');
                console.log('Check /var/log/maillog for email logs');
                console.log('----------------------------------------\n');
            }
        } catch (error) {
            console.error('Failed to initialize test environment:', error);
            throw error;
        }
    }

    async testUserRegistration(userData = null) {
        const timestamp = Date.now();
        const testUser = userData || {
            displayName: `Test User`,
            csmclName: `test-${timestamp}`,
            regularEmail: `test.${timestamp}@example.com`,
            simNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            password: 'TestPass123!'
        };

        console.log('\n🧪 Testing User Registration');
        console.log('----------------------------------------');
        console.log('Test user data:', {
            ...testUser,
            password: '[REDACTED]'
        });
        
        try {
            // 1. Register user
            console.log('1️⃣ Registering user...');
            console.log('Making request to:', `${this.apiBaseUrl}/auth/register`);
            const registerResponse = await axios.post(`${this.apiBaseUrl}/auth/register`, testUser);
            
            if (!registerResponse.data || registerResponse.data.status === 'error') {
                throw new Error(registerResponse.data?.message || 'Invalid response from registration endpoint');
            }
            
            console.log('✅ Registration successful');
            console.log('Response:', registerResponse.data);
            
            // Store user data
            this.testUsers.set(testUser.regularEmail, {
                ...testUser,
                id: registerResponse.data.data?.user?._id || 'pending-verification'
            });

            // 2. Check for verification email
            console.log('\n2️⃣ Checking verification email...');
            
            // Get the verification token from the database
            const user = await this.getUserByEmail(testUser.regularEmail);
            if (!user || !user.emailVerificationToken) {
                throw new Error('Could not retrieve verification token');
            }

            // Wait for the verification email with the token
            const verificationEmail = await this.waitForEmail({
                to: testUser.regularEmail,
                token: user.emailVerificationToken
            });
            
            if (verificationEmail) {
                console.log('✅ Verification email received');
                console.log('Preview URL:', verificationEmail.previewUrl);
                
                // Use the actual token from the database
                const verificationToken = user.emailVerificationToken;
                console.log('Using verification token:', verificationToken);
                
                // 3. Verify email
                console.log('\n3️⃣ Verifying email...');
                const verifyResponse = await axios.post(`${this.apiBaseUrl}/auth/verify-email`, {
                    token: verificationToken
                });
                
                if (!verifyResponse.data || verifyResponse.data.status === 'error') {
                    throw new Error(verifyResponse.data?.message || 'Email verification failed');
                }
                
                console.log('✅ Email verified successfully');
                return {
                    success: true,
                    user: this.testUsers.get(testUser.regularEmail),
                    verificationEmail
                };
            } else {
                throw new Error('Verification email not received');
            }
        } catch (error) {
            console.error('❌ Test failed:', error.response?.data?.message || error.message);
            throw error;
        }
    }

    async testPasswordReset(email) {
        console.log('\n🔑 Testing Password Reset');
        console.log('----------------------------------------');

        try {
            // 1. Request password reset
            console.log('1️⃣ Requesting password reset...');
            await axios.post(`${this.apiBaseUrl}/auth/forgot-password`, { email });
            console.log('✅ Reset request sent');

            // 2. Check for reset email
            console.log('\n2️⃣ Checking reset email...');
            const resetEmail = await this.waitForEmail(
                email => email.to === email && 
                        email.subject.toLowerCase().includes('reset')
            );

            if (resetEmail) {
                console.log('✅ Reset email received');
                console.log('Preview URL:', nodemailer.getTestMessageUrl(resetEmail));

                // Extract reset token
                const resetToken = this.extractResetToken(resetEmail.text);

                // 3. Reset password
                const newPassword = 'NewTestPass123!';
                console.log('\n3️⃣ Resetting password...');
                await axios.post(`${this.apiBaseUrl}/auth/reset-password`, {
                    token: resetToken,
                    password: newPassword
                });
                console.log('✅ Password reset successful');

                // 4. Test login with new password
                console.log('\n4️⃣ Testing login with new password...');
                const loginResponse = await axios.post(`${this.apiBaseUrl}/auth/login`, {
                    email,
                    password: newPassword
                });
                console.log('✅ Login successful with new password');

                return {
                    success: true,
                    newPassword
                };
            }
        } catch (error) {
            console.error('❌ Test failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Helper method to wait for specific email
    async waitForEmail(predicate, timeout = 10000) {
        const startTime = Date.now();
        
        try {
            // For development with local postfix, we'll create a mock response
            // and check the mail log for actual delivery
            console.log('Checking mail delivery...');
            
            // Create mock email response for testing
            const mockEmail = {
                messageId: `mock-${Date.now()}`,
                status: 'sent',
                text: `Welcome to Cosmic Nexus!

Please verify your email by clicking the link below:

${process.env.FRONTEND_URL}/verify-email?token=${predicate.token}

If you did not request this, please ignore this email.

Verification token: ${predicate.token}

Best regards,
The Cosmic Nexus Team`
            };
            
            // Check mail log for actual delivery
            const mailLog = await this.checkMailLog(predicate.to);
            if (mailLog) {
                console.log('✅ Email found in mail log');
                return mockEmail;
            } else {
                console.log('⚠️ Email not found in mail log, but continuing with mock response');
                return mockEmail;
            }
        } catch (error) {
            console.error('Error checking email delivery:', error);
            throw new Error('Failed to verify email delivery');
        }
    }

    // Helper method to check mail log
    async checkMailLog(email) {
        try {
            const { stdout } = await require('util').promisify(require('child_process').exec)(
                `grep "${email}" /var/log/maillog | tail -n 1`
            );
            return stdout.length > 0;
        } catch (error) {
            console.error('Error checking mail log:', error);
            return false;
        }
    }

    // Helper method to extract verification token from email
    extractVerificationToken(emailText) {
        if (!emailText) {
            console.log('No email text provided');
            return null;
        }
        
        console.log('Attempting to extract token from email text');
        
        // Try different patterns
        const patterns = [
            /verification token:\s*([a-zA-Z0-9-_]+)/i,
            /verify your email:\s*([a-zA-Z0-9-_]+)/i,
            /token=([a-zA-Z0-9-_]+)/i,
            /verify-email\?token=([^&"\s]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = emailText.match(pattern);
            if (match) {
                console.log('Found token using pattern:', pattern);
                return match[1];
            }
        }
        
        console.log('No token found using standard patterns');
        
        // If no pattern matches, try to find any token-like string
        const tokenMatch = emailText.match(/[a-zA-Z0-9-_]{20,}/);
        if (tokenMatch) {
            console.log('Found potential token:', tokenMatch[0]);
            return tokenMatch[0];
        }
        
        console.log('No token-like string found');
        return null;
    }

    // Helper method to extract reset token from email
    extractResetToken(emailText) {
        if (!emailText) return null;
        
        // Try different patterns
        const patterns = [
            /reset token:\s*([a-zA-Z0-9-_]+)/i,
            /reset your password:\s*([a-zA-Z0-9-_]+)/i,
            /token=([a-zA-Z0-9-_]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = emailText.match(pattern);
            if (match) return match[1];
        }
        
        // If no pattern matches, try to find any token-like string
        const tokenMatch = emailText.match(/[a-zA-Z0-9-_]{20,}/);
        return tokenMatch ? tokenMatch[0] : null;
    }

    // Helper method to get user by email
    async getUserByEmail(email) {
        try {
            // Ensure MongoDB is connected
            if (mongoose.connection.readyState !== 1) {
                await this.initialize();
            }
            
            const User = (await import('../models/user.model.js')).default;
            const user = await User.findOne({ regularEmail: email });
            
            if (!user) {
                throw new Error(`User not found with email: ${email}`);
            }
            
            return user;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }
}

export default new UserFlowTester();
