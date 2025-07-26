#!/usr/bin/env node

/**
 * Test script to verify VAPI API integration
 * Run with: node test-vapi-integration.js
 */

require('dotenv').config({ path: '.env.local' });

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;

if (!VAPI_API_KEY) {
  console.error('❌ VAPI_PRIVATE_KEY not found in environment variables');
  console.log('Please add VAPI_PRIVATE_KEY to your .env.local file');
  process.exit(1);
}

async function testVapiEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Testing ${description}...`);
    console.log(`   Endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      const count = Array.isArray(data) ? data.length : (data.results ? data.results.length : 'N/A');
      console.log(`   ✅ Success - Retrieved ${count} items`);
      
      // Show sample data structure
      if (Array.isArray(data) && data.length > 0) {
        const sample = data[0];
        console.log(`   📋 Sample fields: ${Object.keys(sample).slice(0, 5).join(', ')}...`);
      } else if (data.results && data.results.length > 0) {
        const sample = data.results[0];
        console.log(`   📋 Sample fields: ${Object.keys(sample).slice(0, 5).join(', ')}...`);
      }
      
      return { success: true, count, data };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 VAPI API Integration Test');
  console.log('============================');
  
  const tests = [
    {
      endpoint: 'https://api.vapi.ai/call?limit=5',
      description: 'Calls List'
    },
    {
      endpoint: 'https://api.vapi.ai/assistant?limit=5',
      description: 'Assistants List'
    },
    {
      endpoint: 'https://api.vapi.ai/logs?limit=5',
      description: 'Logs List'
    }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await testVapiEndpoint(test.endpoint, test.description);
    results.push({ ...test, ...result });
  }

  console.log('\n📊 Test Summary');
  console.log('================');
  
  let successCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.description}: ${result.success ? `${result.count} items` : result.error}`);
    if (result.success) successCount++;
  });

  console.log(`\n🎯 Overall: ${successCount}/${results.length} endpoints working`);
  
  if (successCount === results.length) {
    console.log('🎉 All VAPI endpoints are accessible! Your analytics will show real data.');
  } else if (successCount > 0) {
    console.log('⚠️  Some VAPI endpoints are working. Analytics will show partial real data.');
  } else {
    console.log('🚨 No VAPI endpoints are accessible. Analytics will show mock data only.');
    console.log('   Please check your VAPI_PRIVATE_KEY and network connection.');
  }

  // Test analytics endpoints
  console.log('\n🔍 Testing Analytics Endpoints...');
  console.log('==================================');
  
  const analyticsTests = [
    'http://localhost:3000/api/analytics/overview?timeRange=7d',
    'http://localhost:3000/api/analytics/calls?timeRange=7d',
    'http://localhost:3000/api/analytics/logs?timeRange=7d&limit=5',
    'http://localhost:3000/api/analytics/bots?timeRange=7d'
  ];

  for (const endpoint of analyticsTests) {
    try {
      console.log(`\n🧪 Testing ${endpoint.split('/').pop()}...`);
      const response = await fetch(endpoint);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success: ${data.success ? 'Data retrieved' : 'Failed'}`);
      } else {
        console.log(`   ❌ Failed: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Server not running or endpoint unavailable`);
    }
  }

  console.log('\n🏁 Test Complete!');
  console.log('To view the analytics dashboard, visit: http://localhost:3000');
}

main().catch(console.error);
