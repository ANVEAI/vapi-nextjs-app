#!/bin/bash

# Azure Deployment Script for VAPI Next.js App
# This script handles the complete deployment process including Prisma setup

echo "🚀 Starting Azure deployment for VAPI Next.js App..."
echo "📍 Working directory: $(pwd)"
echo "🔧 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run Prisma setup
setup_prisma() {
    echo "🗄️ Setting up Prisma database..."
    
    if ! command_exists prisma; then
        echo "❌ Prisma CLI not found in PATH"
        if [ -f "./node_modules/.bin/prisma" ]; then
            echo "✅ Found Prisma in node_modules, using npx"
            PRISMA_CMD="npx prisma"
        else
            echo "❌ Prisma not found anywhere, this will cause issues"
            return 1
        fi
    else
        PRISMA_CMD="prisma"
    fi
    
    echo "🔄 Generating Prisma client..."
    $PRISMA_CMD generate
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to generate Prisma client"
        return 1
    fi
    
    echo "🔄 Pushing database schema..."
    $PRISMA_CMD db push --accept-data-loss
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to push database schema"
        return 1
    fi
    
    echo "✅ Prisma setup completed successfully"
    return 0
}

# Function to build Next.js app
build_nextjs() {
    echo "🔨 Building Next.js application..."
    
    if ! command_exists next; then
        if [ -f "./node_modules/.bin/next" ]; then
            echo "✅ Found Next.js in node_modules, using npx"
            npx next build
        else
            echo "❌ Next.js not found"
            return 1
        fi
    else
        next build
    fi
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to build Next.js application"
        return 1
    fi
    
    echo "✅ Next.js build completed successfully"
    return 0
}

# Main deployment process
main() {
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        echo "⚠️ DATABASE_URL not set, database operations may fail"
    else
        echo "✅ DATABASE_URL is configured"
    fi
    
    # Setup Prisma
    if ! setup_prisma; then
        echo "❌ Prisma setup failed, continuing anyway..."
    fi
    
    # Build Next.js (optional, server.js handles this too)
    if ! build_nextjs; then
        echo "⚠️ Build failed, server.js will attempt to build on startup"
    fi
    
    echo "🎯 Starting application..."
    exec node server.js
}

# Run main function
main "$@"