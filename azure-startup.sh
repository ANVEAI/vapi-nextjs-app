#!/bin/bash

echo "🚀 Azure Startup Script - VAPI Next.js Production"
echo "=================================================="

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-8080}

# Log environment info
echo "📍 Working directory: $(pwd)"
echo "🔧 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"
echo "🌐 Port: $PORT"
echo "🗄️ Database URL configured: $([ -n "$DATABASE_URL" ] && echo "Yes" || echo "No")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --only=production
else
    echo "✅ Dependencies already installed"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate || {
    echo "❌ Prisma generate failed, trying alternative method..."
    npm install @prisma/client
    npx prisma generate
}

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy || {
    echo "⚠️ Database migrations failed or no migrations to run"
    echo "🔍 Checking database connection..."
    npx prisma db pull --force || echo "❌ Cannot connect to database"
}

# Check if build exists
if [ ! -d ".next" ]; then
    echo "🏗️ Building Next.js application..."
    npm run build || {
        echo "❌ Build failed, trying alternative build..."
        npx next build
    }
else
    echo "✅ Build directory exists"
fi

# Test database connection
echo "🔍 Testing database connection..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('✅ Database connection successful');
    return prisma.\$disconnect();
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
  });
" || echo "⚠️ Database connection test failed"

echo "🚀 Starting server..."
exec npm start