// Test script for backend API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test API endpoint
    console.log('2. Testing API endpoint...');
    const apiResponse = await axios.get(`${API_BASE_URL}/api/test`);
    console.log('✅ API test passed:', apiResponse.data);
    console.log('');

    // Test deposit endpoint (should fail without proper data)
    console.log('3. Testing deposit endpoint (expected to fail)...');
    try {
      await axios.post(`${API_BASE_URL}/api/wallet/deposit`, {
        amount: 100,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        userId: 'test-user',
        phone: '+251912345678'
      });
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.error?.includes('Payment service not configured')) {
        console.log('✅ Deposit endpoint working (correctly rejected due to missing Chapa config)');
      } else {
        console.log('❌ Deposit endpoint error:', error.response?.data || error.message);
      }
    }
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('\n📝 Notes:');
    console.log('- Health and API endpoints are working');
    console.log('- Deposit endpoint requires Chapa configuration');
    console.log('- Make sure backend is running on port 5000');
    console.log('- Check environment variables are set correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: python app.py');
    console.log('2. Check if port 5000 is available');
    console.log('3. Verify CORS configuration');
    console.log('4. Check environment variables');
  }
}

// Run tests
testAPI(); 