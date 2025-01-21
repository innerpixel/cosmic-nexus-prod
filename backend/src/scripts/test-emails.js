#!/usr/bin/env node

import EmailTester from '../utils/email-tester.js';
import dotenv from 'dotenv';

// Load development environment variables
dotenv.config({ path: '.env.development' });

async function main() {
    try {
        // Initialize the email tester
        await EmailTester.initialize();

        // Run all email tests
        await EmailTester.runAllTests();

    } catch (error) {
        console.error('Error running email tests:', error);
        process.exit(1);
    }
}

main();
