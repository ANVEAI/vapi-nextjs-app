#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { spawn } = require('child_process');

async function runMigrations() {
  console.log('🗄️ Starting database migration process...');
  
  try {
    // First, generate Prisma client
    console.log('🔧 Generating Prisma client...');
    await new Promise((resolve, reject) => {
      const generateProcess = spawn('npx', ['prisma', 'generate'], {
        stdio: 'inherit'
      });
      
      generateProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Prisma client generated successfully');
          resolve();
        } else {
          reject(new Error(`Prisma generate failed with code ${code}`));
        }
      });
    });

    // Then run migrations
    console.log('🚀 Running database migrations...');
    await new Promise((resolve) => {
      const migrateProcess = spawn('npx', ['prisma', 'migrate', 'deploy'], {
        stdio: 'inherit'
      });
      
      migrateProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Database migrations completed successfully');
        } else {
          console.warn(`⚠️ Migration process exited with code ${code}`);
        }
        resolve(); // Always resolve to not fail startup
      });
    });

    // Test database connection
    console.log('🔍 Testing database connection...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Database connection successful');
    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };