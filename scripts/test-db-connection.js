#!/usr/bin/env node

/**
 * Database Connection Test for Azure Deployment
 * Tests the DATABASE_URL and Prisma setup
 */

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('================================');
  
  // Check environment variables
  console.log(`📍 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`🗄️ DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Parse DATABASE_URL to check format
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`🔗 Database Host: ${url.hostname}`);
    console.log(`🔗 Database Port: ${url.port}`);
    console.log(`🔗 Database Name: ${url.pathname.substring(1)}`);
    console.log(`🔗 SSL Mode: ${url.searchParams.get('sslmode') || 'not specified'}`);
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
    process.exit(1);
  }

  // Test Prisma connection
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('\n🔧 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    console.log('\n🔍 Testing basic query...');
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ Basic query successful:', result);

    console.log('\n🔍 Checking database schema...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible, count: ${userCount}`);
    } catch (error) {
      console.warn('⚠️ User table not accessible:', error.message);
      console.log('💡 You may need to run: npx prisma migrate deploy');
    }

    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('invalid port number')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check your DATABASE_URL format');
      console.log('2. Ensure port is exactly :5432');
      console.log('3. Make sure password special characters are URL-encoded');
      console.log('4. Verify sslmode=require is included');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };