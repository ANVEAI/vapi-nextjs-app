# Azure Deployment Fix Guide for VAPI Next.js App

## 🚨 Current Issues Identified

### 1. **Missing Prisma Database Setup**
- Azure only runs `npm install` and `npm start`
- Prisma client generation (`npx prisma generate`) is missing
- Database schema deployment (`npx prisma db push`) is missing
- This causes analytics and bot creation to fail

### 2. **Database Connection String Issue**
Your current DATABASE_URL has encoding issues:
```
DATABASE_URL=postgresql://vapiuser:kanye67%23@vapi-nextjs-production-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

## 🔧 **IMMEDIATE FIXES** (No Redeployment Needed)

### **Step 1: Fix Database Connection String**

In your Azure App Service → Configuration → Application Settings:

**Option A: URL Encode the Password**
```
DATABASE_URL=postgresql://vapiuser:kanye67%2523@vapi-nextjs-production-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Option B: Use Connection String Format**
```
DATABASE_URL=postgresql://vapiuser@vapi-nextjs-production-db:kanye67%23@vapi-nextjs-production-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

### **Step 2: Update Azure Startup Command**

In Azure App Service → Configuration → General Settings:

**Change Startup Command from:**
```
npm start
```

**To:**
```bash
bash startup.sh
```

**OR if bash doesn't work:**
```
node server.js
```

### **Step 3: Add Required Environment Variables**

In Azure App Service → Configuration → Application Settings, add:

```
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=18.17.0
```

## 🚀 **DEPLOYMENT PROCESS FIXES**

### **Option 1: Use Updated server.js (Recommended)**

The updated `server.js` now includes:
- Automatic Prisma client generation
- Database schema deployment
- Proper error handling
- Graceful fallback if database setup fails

### **Option 2: Use Custom Deployment Script**

If you prefer a separate deployment script, use `deploy-azure.sh`:

1. In Azure DevOps or GitHub Actions, add this step before deployment:
```yaml
- name: Setup Database
  run: |
    npm install
    npx prisma generate
    npx prisma db push --accept-data-loss
```

## 🔍 **VERIFICATION STEPS**

### **1. Check Health Endpoint**
After deployment, test:
```
https://vapi-nextjs-production-2025-ethcesheehb6b5e0.centralindia-01.azurewebsites.net/api/health
```

Should return:
```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "connection": true,
    "health": true
  }
}
```

### **2. Test Bot Creation**
Try creating a bot through your dashboard to verify the database is working.

### **3. Check Analytics**
Verify that analytics data is being fetched and stored properly.

## 🛠️ **TROUBLESHOOTING**

### **If Database Connection Still Fails:**

1. **Check Azure PostgreSQL Firewall Rules:**
   - Allow Azure services and resources to access this server
   - Add your Azure App Service IP to allowed IPs

2. **Verify Database Exists:**
   ```bash
   # Connect to your Azure PostgreSQL
   psql "postgresql://vapiuser@vapi-nextjs-production-db:kanye67#@vapi-nextjs-production-db.postgres.database.azure.com:5432/postgres?sslmode=require"
   
   # List databases
   \l
   
   # If 'postgres' database doesn't exist, create it
   CREATE DATABASE postgres;
   ```

3. **Check Connection String Format:**
   For Azure Database for PostgreSQL, use:
   ```
   postgresql://username@servername:password@servername.postgres.database.azure.com:5432/databasename?sslmode=require
   ```

### **If Prisma Setup Fails:**

1. **Manual Database Setup:**
   ```bash
   # SSH into Azure App Service (if available) or use Azure Cloud Shell
   cd /home/site/wwwroot
   npx prisma generate
   npx prisma db push --accept-data-loss
   ```

2. **Check Prisma Schema:**
   Ensure `prisma/schema.prisma` is properly deployed with your app.

## 📋 **DEPLOYMENT CHECKLIST**

- [ ] Fix DATABASE_URL encoding
- [ ] Update Azure startup command to `bash startup.sh` or use updated `server.js`
- [ ] Add NODE_ENV=production environment variable
- [ ] Configure Azure PostgreSQL firewall rules
- [ ] Test health endpoint after deployment
- [ ] Verify bot creation works
- [ ] Check analytics functionality

## 🎯 **EXPECTED RESULTS**

After implementing these fixes:

1. ✅ Database connection will work
2. ✅ Analytics will be fetched properly
3. ✅ Bot creation will succeed
4. ✅ Health endpoint will return "healthy"
5. ✅ No more "c is not a function" errors

## 🔄 **NO FULL REDEPLOYMENT NEEDED**

You can fix this by:
1. Updating Azure App Service configuration (DATABASE_URL, startup command)
2. Restarting the App Service
3. The updated code will handle Prisma setup automatically

The fixes I've implemented in `server.js` will handle the Prisma setup during application startup, so you don't need to redeploy from scratch.