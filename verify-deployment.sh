#!/bin/bash

# 🚀 Azure Deployment Verification Script
# This script helps verify your VAPI Next.js app is ready for Azure deployment

echo "🔍 VAPI Next.js Azure Deployment Verification"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 missing${NC}"
        return 1
    fi
}

# Function to check if a directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1 directory exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 directory missing${NC}"
        return 1
    fi
}

# Function to check environment variable
check_env() {
    if grep -q "$1" .env.local 2>/dev/null; then
        echo -e "${GREEN}✅ $1 configured in .env.local${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $1 not found in .env.local${NC}"
        return 1
    fi
}

echo "📁 Checking Azure Configuration Files..."
echo "----------------------------------------"
check_file "server.js"
check_file "next.config.ts"
check_file "web.config"
check_file "iisnode.yml"
check_file "startup.sh"
check_file "loadable-polyfill.js"
check_file "package.json"
echo ""

echo "🗄️ Checking Database Configuration..."
echo "------------------------------------"
check_file "prisma/schema.prisma"
check_dir "src/lib/services"
check_file "src/lib/database.ts"
check_file "src/lib/services/botService.ts"
check_file "src/lib/services/callService.ts"
check_file "src/lib/services/userService.ts"
echo ""

echo "🔧 Checking Environment Variables..."
echo "-----------------------------------"
check_env "DATABASE_URL"
check_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
check_env "CLERK_SECRET_KEY"
check_env "NEXT_PUBLIC_VAPI_PUBLIC_KEY"
check_env "VAPI_PRIVATE_KEY"
echo ""

echo "🚀 Checking GitHub Actions..."
echo "-----------------------------"
check_file ".github/workflows/master_vapi-voice-bot-test.yml"
echo ""

echo "📦 Checking Package.json Scripts..."
echo "----------------------------------"
if grep -q '"start": "node server.js"' package.json; then
    echo -e "${GREEN}✅ Start script configured for Azure${NC}"
else
    echo -e "${RED}❌ Start script not configured properly${NC}"
fi

if grep -q '"build": "next build"' package.json; then
    echo -e "${GREEN}✅ Build script configured${NC}"
else
    echo -e "${RED}❌ Build script missing${NC}"
fi
echo ""

echo "🔍 Testing Database Connection..."
echo "--------------------------------"
if command -v npx &> /dev/null; then
    echo "Generating Prisma client..."
    npx prisma generate > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Prisma client generated successfully${NC}"
    else
        echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    fi
    
    echo "Testing database connection..."
    if npx prisma db pull > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Database connection failed (this is expected if Azure DB isn't set up yet)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npx not available, skipping database tests${NC}"
fi
echo ""

echo "📊 Deployment Readiness Summary"
echo "==============================="

# Count successful checks
total_checks=0
passed_checks=0

# Core files check
core_files=("server.js" "next.config.ts" "web.config" "iisnode.yml" "package.json" "prisma/schema.prisma")
for file in "${core_files[@]}"; do
    total_checks=$((total_checks + 1))
    if [ -f "$file" ]; then
        passed_checks=$((passed_checks + 1))
    fi
done

# Calculate percentage
percentage=$((passed_checks * 100 / total_checks))

if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}🎉 Deployment Readiness: ${percentage}% - READY TO DEPLOY!${NC}"
    echo ""
    echo -e "${GREEN}Next Steps:${NC}"
    echo "1. Ensure Azure PostgreSQL database is created"
    echo "2. Set environment variables in Azure App Service"
    echo "3. Run: git add . && git commit -m 'Deploy to Azure' && git push origin master"
elif [ $percentage -ge 70 ]; then
    echo -e "${YELLOW}⚠️  Deployment Readiness: ${percentage}% - MOSTLY READY${NC}"
    echo "Please fix the missing files/configurations above"
else
    echo -e "${RED}❌ Deployment Readiness: ${percentage}% - NOT READY${NC}"
    echo "Several critical files are missing. Please check the configuration."
fi

echo ""
echo "📚 For detailed setup instructions, see:"
echo "   - AZURE_SETUP_GUIDE.md"
echo "   - DEPLOYMENT_CHECKLIST.md"
echo "   - DEPLOYMENT_SUMMARY.md"
echo ""
echo "🔗 Useful commands:"
echo "   npx prisma generate    # Generate Prisma client"
echo "   npx prisma db push     # Push schema to database"
echo "   npm run build          # Test build locally"
echo "   npm start              # Test server locally"