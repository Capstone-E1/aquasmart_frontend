/**
 * Simple test script to verify backend API connection
 * Run this in browser console or as a separate script
 */

async function testBackendConnection() {
  const API_URL = 'http://localhost:8080/api/v1/sensors/latest';
  
  console.log('Testing backend connection...');
  console.log('API URL:', API_URL);
  
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Backend connection successful!');
    console.log('Response data:', data);
    
    // Validate data structure
    if (data.success && data.data && Array.isArray(data.data)) {
      console.log('✅ Data structure is valid');
      
      if (data.data.length > 0) {
        const sensorData = data.data[0];
        const requiredFields = ['timestamp', 'ph', 'turbidity', 'tds', 'flow', 'filter_mode'];
        const missingFields = requiredFields.filter(field => !(field in sensorData));
        
        if (missingFields.length === 0) {
          console.log('✅ All required sensor data fields are present');
        } else {
          console.warn('⚠️ Missing sensor data fields:', missingFields);
        }
      } else {
        console.warn('⚠️ No sensor data available');
      }
    } else {
      console.error('❌ Invalid data structure - expected {success: boolean, data: array}');
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('Troubleshooting steps:');
    console.log('1. Make sure backend server is running on localhost:8080');
    console.log('2. Check if the API endpoint is accessible');
    console.log('3. Check for CORS issues');
    console.log('4. Verify the API returns JSON data in the expected format');
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testBackendConnection };
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🧪 AquaSmart Backend Connection Test');
  console.log('To test the connection, run: testBackendConnection()');
}