import axios from 'axios';
import https from 'https';

const testInvalidLoginVPS = async () => {
  try {
    // Create axios instance that ignores SSL verification
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    });

    // Test case 1: Wrong password
    console.log('\nTest 1: Wrong password');
    try {
      await axiosInstance.post('https://csmcl.space/api/auth/login', {
        email: 'nova@csmcl.space',
        password: 'WrongPassword123!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 2: Non-existent email
    console.log('\nTest 2: Non-existent email');
    try {
      await axiosInstance.post('https://csmcl.space/api/auth/login', {
        email: 'nonexistent@csmcl.space',
        password: 'Password123!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 3: Invalid email format
    console.log('\nTest 3: Invalid email format');
    try {
      await axiosInstance.post('https://csmcl.space/api/auth/login', {
        email: 'invalid-email',
        password: 'Password123!'
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    // Test case 4: Empty credentials
    console.log('\nTest 4: Empty credentials');
    try {
      await axiosInstance.post('https://csmcl.space/api/auth/login', {});
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
};

testInvalidLoginVPS();
