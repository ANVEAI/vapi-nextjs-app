import { NextRequest, NextResponse } from 'next/server';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Temporary in-memory storage (replace with database in production)
// Use global to persist across hot reloads in development
const globalForBots = globalThis as unknown as {
  botRegistry: Map<string, any> | undefined;
};

const botRegistry = globalForBots.botRegistry ?? new Map<string, any>();
globalForBots.botRegistry = botRegistry;

export async function GET(request: NextRequest) {
  try {
    // Convert registry to array for easier viewing
    const bots = Array.from(botRegistry.entries()).map(([uuid, bot]) => ({
      uuid,
      name: bot.name,
      status: bot.status,
      vapiAssistantId: bot.vapiAssistantId,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt
    }));

    console.log(`📊 Found ${bots.length} bots in registry`);

    const response = NextResponse.json({
      success: true,
      count: bots.length,
      bots: bots
    });

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('❌ Bot list error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list bots'
      },
      { status: 500 }
    );
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
