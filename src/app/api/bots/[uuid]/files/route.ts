import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  listBotFiles, 
  getFileFromBot, 
  getBotMetadata, 
  verifyBotAccess 
} from '@/lib/localFileStorage';

// In-memory bot registry (same as in create route)
declare global {
  var botRegistry: Map<string, any>;
}

if (!global.botRegistry) {
  global.botRegistry = new Map();
}

const botRegistry = global.botRegistry;

// GET /api/bots/[uuid]/files - List files for a bot
export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const botUuid = params.uuid;

    // Verify bot access
    const botRecord = botRegistry.get(botUuid);
    if (!verifyBotAccess(botUuid, userId, botRecord)) {
      return NextResponse.json(
        { success: false, error: 'Bot not found or access denied' },
        { status: 404 }
      );
    }

    // List files for the bot
    const files = await listBotFiles(botUuid);
    const botMetadata = await getBotMetadata(botUuid);

    return NextResponse.json({
      success: true,
      botUuid,
      files: files.map(fileName => ({
        name: fileName,
        downloadUrl: `/api/bots/${botUuid}/files/${encodeURIComponent(fileName)}`
      })),
      metadata: botMetadata,
      totalFiles: files.length
    });

  } catch (error) {
    console.error('❌ Error listing bot files:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to list files' 
      },
      { status: 500 }
    );
  }
}

// POST /api/bots/[uuid]/files - Upload additional files to a bot (future feature)
export async function POST(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const botUuid = params.uuid;

    // Verify bot access
    const botRecord = botRegistry.get(botUuid);
    if (!verifyBotAccess(botUuid, userId, botRecord)) {
      return NextResponse.json(
        { success: false, error: 'Bot not found or access denied' },
        { status: 404 }
      );
    }

    // For now, return not implemented
    return NextResponse.json(
      { 
        success: false, 
        error: 'File upload to existing bots not yet implemented',
        suggestion: 'Create a new bot with updated files'
      },
      { status: 501 }
    );

  } catch (error) {
    console.error('❌ Error uploading files to bot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload files' 
      },
      { status: 500 }
    );
  }
}
