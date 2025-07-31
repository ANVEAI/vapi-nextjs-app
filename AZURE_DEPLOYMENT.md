# Azure Deployment Guide for VAPI Next.js Production

## Current Setup
- **App Name**: vapi-nextjs-production-2025
- **Database**: Azure Database for PostgreSQL
- **Repository**: https://github.com/ANVEAI/vapi-nextjs-production (master branch)

## Environment Variables Required

In your Azure App Service → Configuration → Application Settings, ensure these are set:

```bash
# Database
DATABASE_URL=postgresql://vapiuser:kanye67%23@vapi-nextjs-production-db.postgres.database.azure.com:5432/postgres?sslmode=require

# Node.js
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=18-lts

# Build Configuration
SCM_DO_BUILD_DURING_DEPLOYMENT=true
ENABLE_ORYX_BUILD=true

# Prisma
PRISMA_CLI_BINARY_TARGETS=native,linux-musl

# Optional: Build Commands
PRE_BUILD_COMMAND=npm ci && npx prisma generate
POST_BUILD_COMMAND=npx prisma migrate deploy
```

## Deployment Process

### Automatic Deployment (GitHub Actions)
1. Push to master branch
2. GitHub Actions will automatically:
   - Install dependencies
   - Generate Prisma client
   - Build the application
   - Deploy to Azure

### Manual Deployment Steps
If you need to deploy manually:

```bash
# 1. Test database connection locally
npm run test:db

# 2. Run deployment script
npm run deploy:azure

# 3. Start the application
npm start
```

## Troubleshooting

### Database Connection Issues

1. **Test your DATABASE_URL format**:
   ```bash
   node scripts/test-db-connection.js
   ```

2. **Common DATABASE_URL issues**:
   - Special characters in password must be URL-encoded (`#` becomes `%23`)
   - Port must be exactly `:5432`
   - Must include `?sslmode=require`

3. **Check Azure PostgreSQL firewall**:
   - Allow Azure services and resources to access this server
   - Add your IP address if testing locally

### Build Issues

1. **Missing Prisma client**:
   ```bash
   npx prisma generate
   ```

2. **Database schema not up to date**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Build fails**:
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

### Health Check

Test your deployment:
```bash
# Local health check
curl http://localhost:8080/api/health

# Azure health check
curl https://vapi-nextjs-production-2025-ethcesheehb6b5e0.centralindia-01.azurewebsites.net/api/health
```

## Azure App Service Configuration

### Startup Command
Set in Azure App Service → Configuration → General Settings:
```bash
npm start
```

### Application Settings
Key environment variables that must be set:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NODE_ENV=production`
- `WEBSITE_NODE_DEFAULT_VERSION=18-lts`

### Deployment Center
- Source: GitHub
- Repository: ANVEAI/vapi-nextjs-production
- Branch: master
- Build provider: GitHub Actions

## File Structure for Deployment

```
├── .github/workflows/
│   └── master_vapi-nextjs-production-2025.yml  # GitHub Actions workflow
├── scripts/
│   ├── deploy-azure.js                          # Deployment script
│   ├── test-db-connection.js                    # Database test
│   └── azure-migrate.js                         # Migration script
├── server.js                                    # Custom server for Azure
├── azure-startup.sh                             # Startup script
├── iisnode.yml                                  # IIS Node configuration
├── web.config                                   # IIS configuration
└── package.json                                 # Updated with Azure scripts
```

## Monitoring and Logs

### View Logs
1. Azure Portal → App Service → Log stream
2. Or use Azure CLI:
   ```bash
   az webapp log tail --name vapi-nextjs-production-2025 --resource-group your-resource-group
   ```

### Health Monitoring
- Health endpoint: `/api/health`
- Returns database connection status and application health

## Common Issues and Solutions

### Issue: "invalid port number in database URL"
**Solution**: Check DATABASE_URL format, ensure port is `:5432`

### Issue: "Cannot find module '@prisma/client'"
**Solution**: Run `npx prisma generate` or redeploy

### Issue: "Build failed with code 1"
**Solution**: Check build logs, ensure all dependencies are installed

### Issue: Database connection timeout
**Solution**: Check Azure PostgreSQL firewall settings

## Support Commands

```bash
# Test database connection
npm run test:db

# Deploy to Azure
npm run deploy:azure

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:deploy

# Health check
npm run health:check
```

## Next Steps After Deployment

1. Test the health endpoint
2. Verify database connectivity
3. Test bot creation functionality
4. Monitor application logs
5. Set up monitoring and alerts