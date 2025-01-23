import fetch from 'node-fetch';
import { Agent } from 'https';

async function testRegistration() {
  try {
    const response = await fetch('https://local-dev.test/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      agent: new Agent({
        rejectUnauthorized: false
      }),
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
    
    // If user creation is pending, poll for status
    if (data.status === 'pending') {
      console.log('User creation started, checking status...');
      await checkUserCreationStatus('csmcltestuser');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function checkUserCreationStatus(username) {
  try {
    const maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const response = await fetch(`https://local-dev.test/api/auth/status/${username}`, {
        agent: new Agent({
          rejectUnauthorized: false
        })
      });
      
      const status = await response.json();
      console.log('Status check:', status);
      
      if (status.status === 'completed') {
        console.log('User creation completed');
        break;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
}

testRegistration();
