# Database Migration Guide

This document outlines the migration from in-memory storage to Azure Database for PostgreSQL.

## Overview

The application has been migrated from using in-memory Maps for data storage to a persistent PostgreSQL database using Prisma ORM. This ensures data persistence across server restarts and provides better scalability.

## Database Schema

### Tables Created

1. **Users** - Extends Clerk user data
   - `id` (String, Primary Key) - Clerk user ID
   - `email` (String, Unique)
   - `firstName`, `lastName`, `imageUrl` (Optional strings)
   - `createdAt`, `updatedAt` (DateTime)

2. **Bots** - Bot configurations and status
   - `id` (String, Primary Key, CUID)
   - `uuid` (String, Unique) - External UUID for API compatibility
   - `name`, `welcomeMessage`, `systemPrompt` (Strings)
   - `language`, `voice` (Strings with defaults)
   - `position` (Enum: LEFT, RIGHT)
   - `theme` (Enum: LIGHT, DARK)
   - `ragEnabled` (Boolean)
   - `ragSourceType` (Enum: FILES, URL)
   - `ragUrl` (Optional string)
   - `status` (Enum: PENDING, ACTIVATING, ACTIVE, FAILED)
   - `embedCode` (Text)
   - `documentsProcessed`, `localFilesStored` (Integers)
   - `vapiAssistantId`, `vapiKnowledgeBaseId` (Optional strings)
   - `localStoragePath` (Optional string)
   - `activationScheduledAt`, `activatedAt` (DateTime)
   - `userId` (Foreign Key to Users)

3. **Documents** - RAG documents and files
   - `id` (String, Primary Key, CUID)
   - `name`, `type` (Strings)
   - `size` (Integer)
   - `content` (Optional text)
   - `chunks` (String array)
   - `pages`, `wordCount` (Optional integers)
   - `filePath` (Optional string)
   - `uploadedAt`, `processedAt` (DateTime)
   - `botId` (Foreign Key to Bots)

4. **Sessions** - User interaction sessions for analytics
   - `id` (String, Primary Key, CUID)
   - `sessionId` (String, Unique) - External session ID
   - `startTime`, `endTime` (DateTime)
   - `userAgent`, `ipAddress` (Optional strings)
   - `interactions` (Integer)
   - `userId` (Foreign Key to Users)
   - `botId` (Foreign Key to Bots)

5. **Calls** - VAPI call logs and analytics
   - `id` (String, Primary Key, CUID)
   - `vapiCallId` (String, Unique) - VAPI call ID
   - `assistantId` (String)
   - `status` (Enum: QUEUED, RINGING, IN_PROGRESS, FORWARDING, ENDED)
   - `endedReason`, `phoneNumber`, `type` (Optional strings)
   - `cost` (Float)
   - `duration` (Optional integer, seconds)
   - `transcript`, `recording`, `summary` (Optional text)
   - `messageCount` (Integer)
   - `createdAt`, `startedAt`, `endedAt` (DateTime)
   - `userId` (Foreign Key to Users)
   - `botId` (Foreign Key to Bots)

## Setup Instructions

### 1. Azure Database for PostgreSQL Setup

```bash
# Create Azure Database for PostgreSQL
az postgres server create \
  --resource-group myResourceGroup \
  --name mypostgresserver \
  --location westus2 \
  --admin-user myadmin \
  --admin-password myPassword123! \
  --sku-name GP_Gen5_2

# Create database
az postgres db create \
  --resource-group myResourceGroup \
  --server-name mypostgresserver \
  --name vapi_nextjs_db

# Configure firewall (allow Azure services)
az postgres server firewall-rule create \
  --resource-group myResourceGroup \
  --server mypostgresserver \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 2. Environment Configuration

Update your `.env.local` file:

```env
# Database Configuration
# Replace with your Azure Database for PostgreSQL connection string
DATABASE_URL="postgresql://myadmin@mypostgresserver:myPassword123!@mypostgresserver.postgres.database.azure.com:5432/vapi_nextjs_db?sslmode=require"
```

### 3. Database Migration

```bash
# Install dependencies (if not already installed)
npm install prisma @prisma/client

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run migration script
npx tsx scripts/migrate-database.ts
```

### 4. Verification

```bash
# Check database connection
npx prisma db pull

# View data in Prisma Studio (optional)
npx prisma studio
```

## API Changes

### Backward Compatibility

All existing API endpoints maintain the same request/response formats. The migration is transparent to frontend components.

### New Features

- **Data Persistence**: All data survives server restarts
- **Better Performance**: Database queries with proper indexing
- **Scalability**: Can handle larger datasets
- **Relationships**: Proper foreign key relationships between entities
- **Transactions**: Atomic operations for data consistency

## Service Layer

New service files provide type-safe database operations:

- `src/lib/services/userService.ts` - User management
- `src/lib/services/botService.ts` - Bot CRUD operations
- `src/lib/services/documentService.ts` - Document management
- `src/lib/services/sessionService.ts` - Session tracking
- `src/lib/services/callService.ts` - Call log management

## Error Handling

The database layer includes comprehensive error handling:

- Connection retry logic
- Graceful degradation
- Proper HTTP status codes
- Detailed error messages for debugging

## Performance Considerations

- **Indexes**: Added on frequently queried fields
- **Connection Pooling**: Prisma handles connection pooling automatically
- **Query Optimization**: Services use efficient queries with proper filtering
- **Pagination**: Large datasets are paginated to prevent memory issues

## Monitoring

Monitor the following:

- Database connection health
- Query performance
- Error rates
- Data consistency

## Rollback Plan

If issues occur, you can temporarily revert to in-memory storage by:

1. Commenting out database service imports
2. Uncommenting the original in-memory Map code
3. Restarting the application

However, this will result in data loss, so ensure proper testing before deployment.

## Security

- All database queries are parameterized (SQL injection protection)
- User data is properly isolated by userId
- Sensitive data is not logged
- Connection strings should be kept secure

## Next Steps

1. Set up automated backups for the Azure database
2. Configure monitoring and alerting
3. Implement database migrations for future schema changes
4. Consider read replicas for better performance if needed
