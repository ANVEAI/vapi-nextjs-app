# Azure Database and App Service Setup Guide

## Overview
This guide will help you set up your VAPI Next.js app on Azure with a PostgreSQL database to ensure all functionalities work properly.

## Step 1: Azure Database for PostgreSQL Setup

### 1.1 Create Azure Database for PostgreSQL

```bash
# Login to Azure CLI
az login

# Set your subscription (replace with your subscription ID)
az account set --subscription "your-subscription-id"

# Create resource group (if not exists)
az group create --name vapi-nextjs-rg --location "Central India"

# Create Azure Database for PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group vapi-nextjs-rg \
  --name vapi-nextjs-postgres \
  --location "Central India" \
  --admin-user vapiuser \
  --admin-password "VapiSecure123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14
```

### 1.2 Configure Database Access

```bash
# Allow Azure services to access the database
az postgres flexible-server firewall-rule create \
  --resource-group vapi-nextjs-rg \
  --name vapi-nextjs-postgres \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your local IP for testing (replace with your IP)
az postgres flexible-server firewall-rule create \
  --resource-group vapi-nextjs-rg \
  --name vapi-nextjs-postgres \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS
```

### 1.3 Create Database

```bash
# Create the application database
az postgres flexible-server db create \
  --resource-group vapi-nextjs-rg \
  --server-name vapi-nextjs-postgres \
  --database-name vapi_nextjs_db
```

## Step 2: Azure App Service Configuration

### 2.1 Update App Service Environment Variables

Go to your Azure App Service → Configuration → Application Settings and add/update these variables:

```env
# Database Configuration
DATABASE_URL=postgresql://vapiuser:VapiSecure123!@vapi-nextjs-postgres.postgres.database.azure.com:5432/vapi_nextjs_db?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_b3B0aW1hbC1xdWFnZ2EtMjEuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_PwYEUqF4HWgB6pnWqr2dStecMSiS3EBxVxUPR1V04K

# VAPI Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=a44bf342-aaf1-440e-98c4-0076388fecf8
VAPI_PRIVATE_KEY=d1191594-f3c2-4c47-9d0d-fad28c27edec
NEXT_PUBLIC_VAPI_ASSISTANT_ID=a635d32d-277b-455b-a87f-11f4a873fd7b

# Google Drive Configuration
GOOGLE_SHARED_DRIVE_ID=0AJbYy5UEADydUk9PVA

# Supabase Configuration (if using)
NEXT_PUBLIC_SUPABASE_URL=https://hozknxxncglmxamyacph.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvemtueHhuY2dsbXhhbXlhY3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzU4MjgsImV4cCI6MjA2ODc1MTgyOH0.0GQJDDeNHVl0yz3-eEegxsNKEOkIFEhUWWY-YFk89Ss
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvemtueHhuY2dsbXhhbXlhY3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE3NTgyOCwiZXhwIjoyMDY4NzUxODI4fQ.LmYQ98ZwFCmTIB7XeESTE4YH9I2m7ZvcFHR80q9_pOs

# Node Environment
NODE_ENV=production
```

**Important**: Make sure "Deployment slot setting" is **UNCHECKED** for all variables.

### 2.2 App Service Configuration Settings

In Azure Portal → App Service → Configuration → General Settings:

- **Stack**: Node.js
- **Major version**: 20 LTS
- **Minor version**: 20.19.1
- **Startup Command**: `npm start`
- **Always On**: On
- **ARR Affinity**: Off

## Step 3: Database Migration and Setup

### 3.1 Local Database Setup (for testing)

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Verify connection
npx prisma db pull
```

### 3.2 Production Database Migration

The database will be automatically set up when your app first runs on Azure, but you can also run migrations manually:

```bash
# From your local machine (with Azure database connection)
DATABASE_URL="postgresql://vapiuser:VapiSecure123!@vapi-nextjs-postgres.postgres.database.azure.com:5432/vapi_nextjs_db?sslmode=require" npx prisma db push
```

## Step 4: GitHub Actions Deployment

### 4.1 Verify GitHub Actions Workflow

Your `.github/workflows/master_vapi-voice-bot-test.yml` should include:

```yaml
name: Build and deploy Node.js app to Azure Web App - vapi-voice-bot-test

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Node.js version
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
    - name: npm install, build
      run: |
        npm install
        npm run build --if-present
    - name: Zip artifact for deployment
      run: zip release.zip ./* -r
    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v3
      with:
        name: node-app
        path: release.zip

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}
    steps:
    - name: Download artifact from build job
      uses: actions/download-artifact@v3
      with:
        name: node-app
    - name: Unzip artifact for deployment
      run: unzip release.zip
    - name: 'Deploy to Azure Web App'
      id: deploy-to-webapp
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'vapi-voice-bot-test'
        slot-name: 'Production'
        publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
        package: .
```

### 4.2 Deploy to Azure

```bash
# Commit and push your changes
git add .
git commit -m "Azure database integration and deployment fixes"
git push origin master
```

## Step 5: Verification and Testing

### 5.1 Monitor Deployment

1. **GitHub Actions**: Check the Actions tab for build/deploy status
2. **Azure Portal**: Monitor App Service logs in real-time
3. **Application Logs**: Check for successful database connection

### 5.2 Expected Log Output

Successful deployment should show:

```
🚀 Starting VAPI Next.js application...
📍 Working directory: /home/site/wwwroot
🔧 Node version: v20.19.1
🌐 Port: 8080
✅ Complete .next build found, skipping build
⚙️ Preparing Next.js application...
✅ Server ready on http://0.0.0.0:8080
```

### 5.3 Test Application Features

1. **Authentication**: Test Clerk login/signup
2. **Bot Creation**: Create a new bot and verify it's saved to database
3. **Analytics**: Check if real-time analytics are working
4. **Database Persistence**: Restart the app and verify data persists

## Step 6: Troubleshooting

### 6.1 Common Issues

**Database Connection Issues**:
- Verify DATABASE_URL is correct
- Check firewall rules allow Azure services
- Ensure database exists and user has permissions

**Build Failures**:
- Check Node.js version compatibility
- Verify all environment variables are set
- Review GitHub Actions logs for specific errors

**Runtime Errors**:
- Check Azure App Service logs
- Verify Prisma client is generated
- Ensure all dependencies are installed

### 6.2 Debug Commands

```bash
# Test database connection locally
npx prisma db pull

# View database in browser
npx prisma studio

# Check Azure logs
az webapp log tail --name vapi-voice-bot-test --resource-group vapi-nextjs-rg
```

## Step 7: Post-Deployment Optimization

### 7.1 Performance Monitoring

Set up monitoring for:
- Database query performance
- Application response times
- Error rates
- Resource utilization

### 7.2 Backup Strategy

```bash
# Set up automated backups
az postgres flexible-server backup create \
  --resource-group vapi-nextjs-rg \
  --name vapi-nextjs-postgres \
  --backup-name daily-backup
```

### 7.3 Scaling Considerations

- Monitor database connections
- Consider connection pooling for high traffic
- Set up auto-scaling rules for App Service

## Security Checklist

- [ ] Database firewall configured properly
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] Authentication working correctly
- [ ] File upload restrictions in place
- [ ] Database user has minimal required permissions

## Success Indicators

✅ **Deployment**: GitHub Actions completes successfully
✅ **Database**: Connection established and tables created
✅ **Authentication**: Clerk login/signup works
✅ **Bot Creation**: Bots are created and persist in database
✅ **Analytics**: Real-time data is captured and stored
✅ **Performance**: Application responds within acceptable time limits

Your VAPI Next.js application should now be fully functional on Azure with persistent database storage!