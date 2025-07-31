#!/bin/bash

echo "🚀 Starting Azure deployment process..."

# Set environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations (if needed)
echo "🗄️ Running database migrations..."
npx prisma migrate deploy || echo "⚠️ Migration failed or no migrations to run"

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Start the server
echo "🚀 Starting server..."
npm start