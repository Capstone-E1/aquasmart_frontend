#!/usr/bin/env node

/**
 * Test script untuk mengecek koneksi backend AquaSmart
 * Run dengan: node test-backend-connection.js
 */

const API_URL = 'http://localhost:8080/api/v1/sensors/latest';

async function testBackendConnection() {
  console.log('🔍 Testing AquaSmart Backend Connection...');
  console.log('📡 API URL:', API_URL);
  console.log('');

  try {
    console.log('⏳ Sending request to backend...');
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📨 Response Status:', response.status, response.statusText);
    console.log('📨 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Response Data:', JSON.stringify(data, null, 2));

    // Validate data structure
    if (data && typeof data === 'object') {
      console.log('');
      console.log('🔍 Validating data structure...');
      
      if (data.success !== undefined) {
        console.log('✅ Has "success" field:', data.success);
      } else {
        console.log('❌ Missing "success" field');
      }

      if (data.data && Array.isArray(data.data)) {
        console.log('✅ Has "data" array with', data.data.length, 'items');
        
        if (data.data.length > 0) {
          const firstItem = data.data[0];
          console.log('📊 First data item:', firstItem);
          
          const requiredFields = ['timestamp', 'ph', 'turbidity', 'tds', 'flow', 'filter_mode'];
          const missingFields = requiredFields.filter(field => !(field in firstItem));
          
          if (missingFields.length === 0) {
            console.log('✅ All required fields present');
          } else {
            console.log('❌ Missing fields:', missingFields);
          }
          
          // Check data types
          console.log('📈 Data values:');
          console.log('  - pH:', firstItem.ph, typeof firstItem.ph);
          console.log('  - Turbidity:', firstItem.turbidity, typeof firstItem.turbidity);
          console.log('  - TDS:', firstItem.tds, typeof firstItem.tds);
          console.log('  - Flow:', firstItem.flow, typeof firstItem.flow);
          console.log('  - Filter Mode:', firstItem.filter_mode, typeof firstItem.filter_mode);
          console.log('  - Timestamp:', firstItem.timestamp, typeof firstItem.timestamp);
        } else {
          console.log('⚠️ Data array is empty');
        }
      } else {
        console.log('❌ Missing or invalid "data" array');
      }
    } else {
      console.log('❌ Invalid response data structure');
    }

    console.log('');
    console.log('🎉 Backend connection test completed successfully!');

  } catch (error) {
    console.error('');
    console.error('❌ Backend connection test failed!');
    console.error('🚨 Error:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting steps:');
    console.error('1. Check if backend server is running on localhost:8080');
    console.error('2. Verify the API endpoint /api/v1/sensors/latest exists');
    console.error('3. Check for CORS configuration on backend');
    console.error('4. Ensure backend returns JSON in expected format');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('5. Backend server might not be running');
    }
  }
}

// Run the test
testBackendConnection();