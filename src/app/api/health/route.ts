import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // Test basic connection
    await prisma.$connect();
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test if tables exist
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connection: true,
        health: true,
        message: 'Database connection successful',
        userCount,
        testQuery: result
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    });
    
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connection: false,
        health: false,
        message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.stack : String(error)
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    }, { status: 500 });
  }
}