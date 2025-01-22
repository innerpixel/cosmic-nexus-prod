import fetch from 'node-fetch';

async function testRegistration() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayName: "CSMCL Test User",
        csmclName: "csmcltestuser",
        regularEmail: "csmcltestuser@local.test",
        simNumber: "41771234567",
        password: "TestPass123!"
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration();
