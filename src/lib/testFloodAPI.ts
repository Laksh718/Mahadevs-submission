// Test script to check if the flood prediction API is working
export const testFloodAPI = async () => {
  console.log('🧪 Testing Flood Prediction API...');
  
  const apiUrl = import.meta.env.VITE_BACKEND_URL || 'https://janrakshak-pre-alert-model.onrender.com';
  console.log('API URL:', apiUrl);
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${apiUrl}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Health check status:', healthResponse.status);
    
    // Test 2: Basic prediction
    console.log('2. Testing prediction endpoint...');
    const predictionResponse = await fetch(`${apiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 13.0827,
        lon: 80.2707
      })
    });
    
    console.log('Prediction status:', predictionResponse.status);
    
    if (predictionResponse.ok) {
      const data = await predictionResponse.json();
      console.log('✅ Prediction successful:', data);
      return { success: true, data };
    } else {
      const errorText = await predictionResponse.text();
      console.log('❌ Prediction failed:', errorText);
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test Windy API
export const testWindyAPI = async () => {
  console.log('🌤️ Testing Windy API...');
  
  const windyKey = import.meta.env.WINDY_API || 'g2m3HcyH0yVSaf54Naep9RPvE88hJXQl';
  console.log('Windy API Key:', windyKey.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: 30.7333,
        lon: 76.7794,
        model: 'gfs',
        parameters: ['temp', 'rh', 'wind', 'pressure', 'precip'],
        levels: ['surface'],
        key: windyKey
      })
    });
    
    console.log('Windy API status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Windy API successful:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ Windy API failed:', errorText);
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.error('❌ Windy API test failed:', error);
    return { success: false, error: error.message };
  }
};