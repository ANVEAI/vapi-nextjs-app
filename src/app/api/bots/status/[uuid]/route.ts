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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    if (!uuid) {
      const response = NextResponse.json(
        { success: false, error: 'Bot UUID is required' },
        { status: 400 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Get bot from registry
    const bot = botRegistry.get(uuid);

    console.log(`🔍 Looking for bot ${uuid}, found:`, bot ? 'YES' : 'NO');
    console.log(`📊 Registry size: ${botRegistry.size}`);

    if (!bot) {
      const response = NextResponse.json(
        { success: false, error: 'Bot not found' },
        { status: 404 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Check if bot should be activated (24 hours have passed)
    const now = new Date();
    const activationTime = new Date(bot.activationScheduledAt);
    const shouldBeActive = now >= activationTime;

    // Update status if needed
    if (shouldBeActive && bot.status === 'pending') {
      bot.status = 'activating';
      botRegistry.set(uuid, bot);
      
      // In a real implementation, trigger VAPI assistant creation here
      console.log(`🔄 Bot ${uuid} should be activated now`);
      
      // Simulate activation process
      setTimeout(() => {
        bot.status = 'active';
        bot.vapiAssistantId = `vapi_assistant_${uuid.substring(0, 8)}`;
        botRegistry.set(uuid, bot);
        console.log(`✅ Bot ${uuid} activated successfully`);
      }, 5000);
    }

    const response = NextResponse.json({
      success: true,
      status: bot.status,
      uuid: bot.uuid,
      name: bot.name,
      activationScheduledAt: bot.activationScheduledAt,
      vapiAssistantId: bot.vapiAssistantId,
      activatedAt: bot.activatedAt
    });

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('❌ Bot status check error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check bot status'
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
// Handle PATCH request to update bot assistant ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const { vapiAssistantId } = await request.json();

    if (!uuid) {
      const response = NextResponse.json(
        { success: false, error: 'Bot UUID is required' },
        { status: 400 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    if (!vapiAssistantId) {
      const response = NextResponse.json(
        { success: false, error: 'VAPI Assistant ID is required' },
        { status: 400 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Get bot from registry
    const bot = botRegistry.get(uuid);

    if (!bot) {
      const response = NextResponse.json(
        { success: false, error: 'Bot not found' },
        { status: 404 }
      );
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Update the bot's VAPI assistant ID
    bot.vapiAssistantId = vapiAssistantId;
    bot.updatedAt = new Date().toISOString();
    botRegistry.set(uuid, bot);

    console.log(`✅ Updated bot ${uuid} with new VAPI assistant ID: ${vapiAssistantId}`);

    const response = NextResponse.json({
      success: true,
      message: 'Bot assistant ID updated successfully',
      uuid: bot.uuid,
      vapiAssistantId: bot.vapiAssistantId
    });

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('❌ Bot update error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update bot'
      },
      { status: 500 }
    );
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
