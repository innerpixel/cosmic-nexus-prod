import axios from 'axios';
import https from 'https';

const testVPSRegistration = async () => {
  try {
    // Create axios instance that ignores SSL verification for development
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    });

    console.log('\nTest 1: Valid Registration');
    try {
      const response = await axiosInstance.post('https://csmcl.space/api/v1/auth/register', {
        displayName: "Dumbledore The Wise",
        csmclName: "dumbledore",
        regularEmail: "dumbledore@csmcl.space",
        simNumber: "+12345678922",
        password: "LemonDrop789!"
      });
      console.log('Registration Response:', response.data);
    } catch (error) {
      console.error('Registration Error:', error.response?.data || error.message);
    }

    console.log('\nTest 2: Missing Required Fields');
    try {
      await axiosInstance.post('https://csmcl.space/api/v1/auth/register', {
        displayName: "Incomplete User"
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    console.log('\nTest 3: Invalid Email Format');
    try {
      await axiosInstance.post('https://csmcl.space/api/v1/auth/register', {
        displayName: "Invalid Email User",
        csmclName: "invalid",
        regularEmail: "not-an-email",
        simNumber: "+12345678923",
        password: "Password123!"
      });
    } catch (error) {
      console.log('Expected error:', error.response?.data || error.message);
    }

    console.log('\nTest 4: Invalid Phone Number');
    try {
      await axiosInstance.post('https://csmcl.space/api/v1/auth/register', {
        displayName: "Invalid Phone User",
        csmclName: "invalid-phone",
        regularEmail: "invalid.phone@csmcl.space",
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
