#!/usr/bin/env node

import UserFlowTester from '../utils/user-flow-tester.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load development environment variables
dotenv.config({ path: '.env.development' });

async function runTests() {
    try {
        // Initialize the test environment
        await UserFlowTester.initialize();

        console.log('\n🔄 Starting User Flow Tests');
        console.log('========================================');

        // Test 1: New User Registration
        console.log('\n📝 Test Case: New User Registration');
        const timestamp = Date.now();
        const testUser = {
            displayName: `Test User`,
            csmclName: `test-${timestamp}`,
            regularEmail: `test.${timestamp}@example.com`,
            simNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            password: 'TestPass123!'
        };

        try {
            // Run registration test
            const result = await UserFlowTester.testUserRegistration(testUser);
            console.log('\n✅ Registration test completed successfully');
            console.log('User:', result.user);
        } catch (error) {
            console.error('\n❌ Registration test failed:', error.message);
            if (error.response?.data) {
                console.error('Server response:', error.response.data);
            }
        }

        console.log('\n📊 Test Summary');
        console.log('========================================');
        console.log('✅ All tests completed');
        console.log('\nView all test emails at: https://ethereal.email/messages');
        console.log('Login with the credentials shown above to view email contents');

    } catch (error) {
        console.error('\n❌ Test setup failed:', error.message);
        if (error.response?.data) {
            console.error('Server response:', error.response.data);
        }
    } finally {
        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\nMongoDB connection closed');
        }
        process.exit(0);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('\n❌ Unhandled promise rejection:', error);
    process.exit(1);
});

runTests();
