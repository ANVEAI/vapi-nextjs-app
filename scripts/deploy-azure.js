#!/usr/bin/env node

/**
 * Azure Deployment Script for VAPI Next.js Production
 * This script handles the complete deployment process including Prisma setup
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${command} ${args.join(' ')}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function deployToAzure() {
  try {
    console.log('🚀 Starting Azure deployment process...');
    console.log('==========================================');

    // Step 1: Install dependencies
    console.log('\n📦 Step 1: Installing dependencies...');
    await runCommand('npm', ['ci', '--only=production']);

    // Step 2: Generate Prisma client
    console.log('\n🔧 Step 2: Generating Prisma client...');
    await runCommand('npx', ['prisma', 'generate']);

    // Step 3: Run database migrations
    console.log('\n🗄️ Step 3: Running database migrations...');
    try {
      await runCommand('npx', ['prisma', 'migrate', 'deploy']);
    } catch (error) {
      console.warn('⚠️ Migration failed, but continuing deployment...');
    }

    // Step 4: Build the application
    console.log('\n🏗️ Step 4: Building Next.js application...');
    await runCommand('npm', ['run', 'build']);

    // Step 5: Test the build
    console.log('\n🔍 Step 5: Verifying build...');
    const nextDir = path.join(__dirname, '.next');
    const buildId = path.join(nextDir, 'BUILD_ID');
    
    if (fs.existsSync(nextDir) && fs.existsSync(buildId)) {
      console.log('✅ Build verification successful');
    } else {
      throw new Error('Build verification failed - .next directory or BUILD_ID missing');
    }

    // Step 6: Test database connection
    console.log('\n🔍 Step 6: Testing database connection...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$connect();
      console.log('✅ Database connection successful');
      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }

    console.log('\n✅ Deployment preparation completed successfully!');
    console.log('🚀 Ready to start the server with: npm start');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  deployToAzure();
}

module.exports = { deployToAzure };