# 🚀 Azure Deployment Verification Script (PowerShell)
# This script helps verify your VAPI Next.js app is ready for Azure deployment

Write-Host "🔍 VAPI Next.js Azure Deployment Verification" -ForegroundColor Cyan
Write-Host "==============================================`n"

# Function to check if a file exists
function Check-File {
    param($FilePath)
    if (Test-Path $FilePath) {
        Write-Host "✅ $FilePath exists" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $FilePath missing" -ForegroundColor Red
        return $false
    }
}

# Function to check if a directory exists
function Check-Directory {
    param($DirPath)
    if (Test-Path $DirPath -PathType Container) {
        Write-Host "✅ $DirPath directory exists" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $DirPath directory missing" -ForegroundColor Red
        return $false
    }
}

# Function to check environment variable in .env.local
function Check-EnvVar {
    param($VarName)
    if (Test-Path ".env.local") {
        $content = Get-Content ".env.local" -Raw
        if ($content -match $VarName) {
            Write-Host "✅ $VarName configured in .env.local" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $VarName not found in .env.local" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "⚠️  .env.local file not found" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "📁 Checking Azure Configuration Files..." -ForegroundColor Yellow
Write-Host "----------------------------------------"
$coreFiles = @("server.js", "next.config.ts", "web.config", "iisnode.yml", "startup.sh", "loadable-polyfill.js", "package.json")
$passedCore = 0
foreach ($file in $coreFiles) {
    if (Check-File $file) { $passedCore++ }
}
Write-Host ""

Write-Host "🗄️ Checking Database Configuration..." -ForegroundColor Yellow
Write-Host "------------------------------------"
$dbFiles = @("prisma/schema.prisma", "src/lib/database.ts", "src/lib/services/botService.ts", "src/lib/services/callService.ts", "src/lib/services/userService.ts")
$passedDb = 0
foreach ($file in $dbFiles) {
    if (Check-File $file) { $passedDb++ }
}
Check-Directory "src/lib/services"
Write-Host ""

Write-Host "🔧 Checking Environment Variables..." -ForegroundColor Yellow
Write-Host "-----------------------------------"
$envVars = @("DATABASE_URL", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY", "NEXT_PUBLIC_VAPI_PUBLIC_KEY", "VAPI_PRIVATE_KEY")
$passedEnv = 0
foreach ($var in $envVars) {
    if (Check-EnvVar $var) { $passedEnv++ }
}
Write-Host ""

Write-Host "🚀 Checking GitHub Actions..." -ForegroundColor Yellow
Write-Host "-----------------------------"
Check-File ".github/workflows/master_vapi-voice-bot-test.yml"
Write-Host ""

Write-Host "📦 Checking Package.json Scripts..." -ForegroundColor Yellow
Write-Host "----------------------------------"
if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" -Raw
    if ($packageContent -match '"start": "node server.js"') {
        Write-Host "✅ Start script configured for Azure" -ForegroundColor Green
    } else {
        Write-Host "❌ Start script not configured properly" -ForegroundColor Red
    }
    
    if ($packageContent -match '"build": "next build"') {
        Write-Host "✅ Build script configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Build script missing" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "🔍 Testing Prisma Setup..." -ForegroundColor Yellow
Write-Host "-------------------------"
try {
    $null = Get-Command npx -ErrorAction Stop
    Write-Host "Generating Prisma client..."
    $result = & npx prisma generate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  npx not available, skipping Prisma tests" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📊 Deployment Readiness Summary" -ForegroundColor Cyan
Write-Host "==============================="

# Calculate readiness percentage
$totalChecks = $coreFiles.Count + $dbFiles.Count + $envVars.Count
$passedChecks = $passedCore + $passedDb + $passedEnv
$percentage = [math]::Round(($passedChecks / $totalChecks) * 100)

if ($percentage -ge 90) {
    Write-Host "🎉 Deployment Readiness: $percentage% - READY TO DEPLOY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Green
    Write-Host "1. Ensure Azure PostgreSQL database is created"
    Write-Host "2. Set environment variables in Azure App Service"
    Write-Host "3. Run deployment commands:"
    Write-Host "   git add ."
    Write-Host "   git commit -m 'Deploy to Azure'"
    Write-Host "   git push origin master"
} elseif ($percentage -ge 70) {
    Write-Host "⚠️  Deployment Readiness: $percentage% - MOSTLY READY" -ForegroundColor Yellow
    Write-Host "Please fix the missing files/configurations above"
} else {
    Write-Host "❌ Deployment Readiness: $percentage% - NOT READY" -ForegroundColor Red
    Write-Host "Several critical files are missing. Please check the configuration."
}

Write-Host ""
Write-Host "📚 For detailed setup instructions, see:" -ForegroundColor Cyan
Write-Host "   - AZURE_SETUP_GUIDE.md"
Write-Host "   - DEPLOYMENT_CHECKLIST.md"
Write-Host "   - DEPLOYMENT_SUMMARY.md"
Write-Host ""
Write-Host "🔗 Useful commands:" -ForegroundColor Cyan
Write-Host "   npx prisma generate    # Generate Prisma client"
Write-Host "   npx prisma db push     # Push schema to database"
Write-Host "   npm run build          # Test build locally"
Write-Host "   npm start              # Test server locally"