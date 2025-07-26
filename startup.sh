#!/bin/bash

echo "🚀 Azure App Service Startup Script for VAPI Next.js App"
echo "📍 Working directory: $(pwd)"
echo "🔧 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"
echo "🌐 Port: ${PORT:-8080}"

# List directory contents for debugging
echo "📁 Directory contents:"
ls -la

# Check if node_modules exists (should be symlinked by Azure)
if [ -L "node_modules" ]; then
    echo "✅ node_modules symlink found"
    ls -la node_modules/.bin/ | head -10
elif [ -d "node_modules" ]; then
    echo "✅ node_modules directory found"
    ls -la node_modules/.bin/ | head -10
else
    echo "❌ node_modules not found, installing dependencies..."
    npm install --production
fi

# Check for Next.js binary
if [ -f "./node_modules/.bin/next" ]; then
    echo "✅ Next.js binary found at ./node_modules/.bin/next"
elif [ -f "/node_modules/.bin/next" ]; then
    echo "✅ Next.js binary found at /node_modules/.bin/next"
else
    echo "⚠️ Next.js binary not found in expected locations"
fi

# Set NODE_PATH to ensure modules are found
export NODE_PATH="/node_modules:./node_modules:$NODE_PATH"
export PATH="/node_modules/.bin:./node_modules/.bin:$PATH"

echo "🔧 NODE_PATH: $NODE_PATH"
echo "🔧 PATH: $PATH"

# Start the Next.js application using our custom server
echo "🎯 Starting VAPI Next.js application on port ${PORT:-8080}..."
npm start
