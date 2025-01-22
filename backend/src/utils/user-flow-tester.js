import axios from 'axios';
import mongoose from 'mongoose';
import EmailTester from './email-tester.js';

class UserFlowTester {
    constructor() {
        this.baseUrl = process.env.API_URL || 'http://localhost:5000/api';
        this.emailTester = EmailTester;
    }

    async initialize() {
        try {
            // Connect to MongoDB
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmic-nexus-dev', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('MongoDB connected successfully\n');

            // Initialize email testing environment
            const emailConfig = await this.emailTester.initialize();
            
            console.log('\n🔧 Test Environment Ready');
            console.log('----------------------------------------');
            console.log('Using Ethereal for email testing');
            console.log('View emails at: https://ethereal.email');
            console.log('Login with:', emailConfig.user);
            console.log('----------------------------------------\n');

        } catch (error) {
            console.error('Failed to initialize test environment:', error);
            throw error;
        }
    }

    async testUserRegistration(userData) {
        console.log('\n🧪 Testing User Registration');
        console.log('----------------------------------------');
        console.log('Test user data:', {
            ...userData,
            password: '[REDACTED]'
        });

        try {
            console.log('1️⃣ Registering user...');
            console.log('Making request to:', `${this.baseUrl}/auth/register`);
            
            const response = await axios.post(`${this.baseUrl}/auth/register`, userData);
            
            if (response.data.status === 'success') {
                console.log('✅ User registered successfully');
                return response.data;
            } else {
                console.log('❌ Registration failed:', response.data.message);
                throw new Error('Registration failed: ' + response.data.message);
            }
        } catch (error) {
            console.log('❌ Test failed:', error.response?.data?.message || 'An error occurred while registering');
            throw error;
        }
    }

    async cleanup() {
        try {
            await mongoose.connection.close();
            console.log('\nMongoDB connection closed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

export default new UserFlowTester();
