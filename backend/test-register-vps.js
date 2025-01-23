import axios from 'axios';
import https from 'https';

const testVPSRegistration = async () => {
  try {
    // Create axios instance that ignores SSL verification for development
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('\nTest 1: Valid Registration');
    try {
      const response = await axiosInstance.post('https://csmcl.space/api/auth/register', {
        displayName: "Nova Stardust",
        csmclName: "nova-stardust",
        regularEmail: "nova@cosmical.me", // Using cosmical.me domain for testing
        simNumber: "+12025550179",
        password: "NovaStardust2025!"
      });
      console.log('Registration Response:', response.data);
      
      // If registration successful, we should receive a pending status
      if (response.data.status === 'pending') {
        console.log('Registration pending. Check verification email at nova@cosmical.me');
      }
    } catch (error) {
      console.error('Registration Error:', error.response?.data || error.message);
    }

    console.log('\nTest 2: Missing Required Fields');
    try {
      await axiosInstance.post('https://csmcl.space/api/auth/register', {
        displayName: "Incomplete User"
        // Missing other required fields
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    console.log('\nTest 3: Invalid Email Format');
    try {
      await axiosInstance.post('https://csmcl.space/api/auth/register', {
        displayName: "Invalid Email User",
        csmclName: "invalid-email",
        regularEmail: "not-an-email",
        simNumber: "+12025550180",
        password: "Password123!"
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    console.log('\nTest 4: Invalid Phone Number');
    try {
      await axiosInstance.post('https://csmcl.space/api/auth/register', {
        displayName: "Invalid Phone User",
        csmclName: "invalid-phone",
        regularEmail: "invalid.phone@cosmical.me",
        simNumber: "not-a-phone",
        password: "Password123!"
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
};

testVPSRegistration();
