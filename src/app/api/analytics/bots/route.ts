import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// In-memory bot registry (same as in create route)
declare global {
  var botRegistry: Map<string, any>;
}

if (!global.botRegistry) {
  global.botRegistry = new Map();
}

const botRegistry = global.botRegistry;

// GET /api/analytics/bots - Bot usage analytics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d'; // 7d, 30d, 90d, all
    const userFilter = searchParams.get('userFilter') || 'all'; // all, current

    // Get local bot registry data
    const allBots = Array.from(botRegistry.values());
    const filteredBots = userFilter === 'current'
      ? allBots.filter(bot => bot.userId === userId)
      : allBots;

    // Calculate time range
    const now = new Date();
    let startDate = new Date(0); // Beginning of time for 'all'

    if (timeRange !== 'all') {
      const days = parseInt(timeRange.replace('d', ''));
      startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    }

    // Filter local bots by time range
    const botsInRange = filteredBots.filter(bot => {
      const createdAt = new Date(bot.createdAt);
      return createdAt >= startDate;
    });

    // Fetch real VAPI assistant data
    const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;
    let vapiAssistants = [];
    let vapiCalls = [];

    if (VAPI_API_KEY) {
      try {
        // Fetch assistants from VAPI
        const assistantsResponse = await fetch('https://api.vapi.ai/assistant', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (assistantsResponse.ok) {
          const assistantsData = await assistantsResponse.json();
          vapiAssistants = Array.isArray(assistantsData) ? assistantsData : [];
          console.log(`✅ Retrieved ${vapiAssistants.length} assistants from VAPI for bot analytics`);
        }

        // Fetch calls to get usage data
        const callsUrl = new URL('https://api.vapi.ai/call');
        callsUrl.searchParams.set('limit', '1000');
        // Note: Date filtering will be done client-side for now

        const callsResponse = await fetch(callsUrl.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (callsResponse.ok) {
          const callsData = await callsResponse.json();
          vapiCalls = Array.isArray(callsData) ? callsData : [];
          console.log(`✅ Retrieved ${vapiCalls.length} calls from VAPI for bot analytics`);
        }
      } catch (vapiError) {
        console.warn('⚠️ VAPI API unavailable for bot analytics, using local data only:', vapiError);
      }
    }

    // Calculate analytics combining local and VAPI data
    const totalLocalBots = botsInRange.length;
    const totalVapiBots = vapiAssistants.length;
    const totalBots = totalLocalBots; // Use local bots as primary count

    const activeBots = botsInRange.filter(bot => bot.status === 'active').length;
    const inactiveBots = totalBots - activeBots;
    const ragEnabledBots = botsInRange.filter(bot => bot.ragEnabled).length;
    const ragDisabledBots = totalBots - ragEnabledBots;

    // Calculate call usage per assistant from VAPI data
    const assistantCallCounts = {};
    vapiCalls.forEach(call => {
      if (call.assistantId) {
        assistantCallCounts[call.assistantId] = (assistantCallCounts[call.assistantId] || 0) + 1;
      }
    });

    // Bot creation trends (group by day)
    const creationTrends = {};
    botsInRange.forEach(bot => {
      const date = new Date(bot.createdAt).toISOString().split('T')[0];
      creationTrends[date] = (creationTrends[date] || 0) + 1;
    });

    // Top performing bots combining local and VAPI data
    const topBots = [];

    // Add local bots with their call counts from VAPI
    botsInRange.forEach(bot => {
      const callCount = assistantCallCounts[bot.assistantId] || 0;
      topBots.push({
        uuid: bot.uuid,
        name: bot.name,
        documentsProcessed: bot.documentsProcessed || 0,
        callCount: callCount,
        createdAt: bot.createdAt,
        status: bot.status
      });
    });

    // Add VAPI assistants that might not be in local registry
    vapiAssistants.forEach(assistant => {
      const existsInLocal = botsInRange.some(bot => bot.assistantId === assistant.id);
      if (!existsInLocal) {
        const callCount = assistantCallCounts[assistant.id] || 0;
        topBots.push({
          uuid: assistant.id,
          name: assistant.name || `Assistant ${assistant.id.substring(0, 8)}`,
          documentsProcessed: 0,
          callCount: callCount,
          createdAt: assistant.createdAt,
          status: 'active'
        });
      }
    });

    // Sort by call count and take top 10
    const mostUsedBots = topBots
      .sort((a, b) => (b.callCount || 0) - (a.callCount || 0))
      .slice(0, 10);

    // Voice and language distribution from local and VAPI data
    const voiceDistribution = {};
    const languageDistribution = {};

    // Count from local bots
    botsInRange.forEach(bot => {
      const voice = bot.voice || 'unknown';
      const language = bot.language || 'unknown';

      voiceDistribution[voice] = (voiceDistribution[voice] || 0) + 1;
      languageDistribution[language] = (languageDistribution[language] || 0) + 1;
    });

    // Count from VAPI assistants
    vapiAssistants.forEach(assistant => {
      const voice = assistant.voice?.voiceId || assistant.voice?.provider || 'unknown';
      const language = assistant.transcriber?.language || 'unknown';

      voiceDistribution[voice] = (voiceDistribution[voice] || 0) + 1;
      languageDistribution[language] = (languageDistribution[language] || 0) + 1;
    });

    // Recent bot activity
    const recentBots = botsInRange
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(bot => ({
        uuid: bot.uuid,
        name: bot.name,
        status: bot.status,
        createdAt: bot.createdAt,
        ragEnabled: bot.ragEnabled,
        documentsProcessed: bot.documentsProcessed || 0
      }));

    return NextResponse.json({
      success: true,
      timeRange,
      userFilter,
      analytics: {
        overview: {
          totalBots,
          activeBots,
          inactiveBots,
          ragEnabledBots,
          ragDisabledBots
        },
        trends: {
          creationTrends: Object.entries(creationTrends).map(([date, count]) => ({
            date,
            count
          })).sort((a, b) => a.date.localeCompare(b.date))
        },
        topBots: mostUsedBots,
        distributions: {
          voice: Object.entries(voiceDistribution).map(([voice, count]) => ({
            voice,
            count
          })),
          language: Object.entries(languageDistribution).map(([language, count]) => ({
            language,
            count
          }))
        },
        recentActivity: recentBots
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        totalBotsInSystem: allBots.length,
        userBotsCount: allBots.filter(bot => bot.userId === userId).length
      }
    });

  } catch (error) {
    console.error('❌ Analytics bots error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve bot analytics' 
      },
      { status: 500 }
    );
  }
}
