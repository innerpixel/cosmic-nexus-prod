import axios from 'axios';

const testVPSRegistration = async () => {
  try {
    const response = await axios.post('https://csmcl.space/api/auth/register', {
      displayName: "Dumbledore The Wise",
      csmclName: "dumbledore",
      regularEmail: "dumbledore@csmcl.space",
      simNumber: "+12345678922",
      password: "LemonDrop789!"
    });

    console.log('VPS Registration Response:', response.data);
  } catch (error) {
    console.error('VPS Registration Error:', error.response?.data || error.message);
  }
};

testVPSRegistration();
