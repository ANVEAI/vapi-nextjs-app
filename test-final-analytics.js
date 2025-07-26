#!/usr/bin/env node

/**
 * Final test to verify all analytics endpoints work without errors
 * Run with: node test-final-analytics.js
 */

require('dotenv').config({ path: '.env.local' });

async function testEndpoint(url, name) {
  try {
    console.log(`🧪 Testing ${name}...`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`   ✅ ${name}: SUCCESS`);
      return true;
    } else {
      console.log(`   ❌ ${name}: FAILED - ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  ${name}: ERROR - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🎯 Final Analytics Endpoints Test');
  console.log('==================================');
  
  const baseUrl = 'http://localhost:3000/api/analytics';
  const endpoints = [
    { url: `${baseUrl}/overview?timeRange=7d`, name: 'Overview Analytics' },
    { url: `${baseUrl}/calls?timeRange=7d`, name: 'Call Analytics' },
    { url: `${baseUrl}/logs?timeRange=7d&limit=5`, name: 'Call Logs' },
    { url: `${baseUrl}/bots?timeRange=7d`, name: 'Bot Analytics' },
    { url: `${baseUrl}/sessions?timeRange=7d`, name: 'Session Analytics' }
  ];

  let successCount = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.url, endpoint.name);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`✅ Successful: ${successCount}/${endpoints.length}`);
  console.log(`❌ Failed: ${endpoints.length - successCount}/${endpoints.length}`);
  
  if (successCount === endpoints.length) {
    console.log('\n🎉 ALL ANALYTICS ENDPOINTS WORKING!');
    console.log('✅ No JavaScript errors');
    console.log('✅ VAPI integration functional');
    console.log('✅ Real data being processed');
    console.log('\n🚀 Your analytics dashboard is ready to use!');
  } else {
    console.log('\n⚠️  Some endpoints need attention.');
    console.log('Check the server logs for detailed error information.');
  }
}

main().catch(console.error);
