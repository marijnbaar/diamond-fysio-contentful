import { manualTokenRefresh } from '../../../pages/api/fetchPosts.js';
import { checkBotId } from 'botid/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

async function handleRequest(request: Request) {
  const authorization = request.headers.get('authorization');
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // 1. Check if authorized (e.g. Cron Job) - Bypasses BotID check
  // This ensures your cron job always works, even if flagged as a bot.
  if (webhookSecret && authorization === `Bearer ${webhookSecret}`) {
    return runTokenRefresh(authorization, webhookSecret);
  }

  // 2. Bot Protection
  // Only run BotID check if we are NOT in development mode OR if we have keys configured.
  // This allows local development to proceed without needing BotID keys.
  const shouldCheckBotId = process.env.NODE_ENV !== 'development' || process.env.BOTID_SECRET_KEY;

  if (shouldCheckBotId) {
    try {
      const botResult = await checkBotId();
      const { isBot, isVerifiedBot } = botResult;

      // Access verifiedBotName safely as it might not exist on the returned type
      const verifiedBotName =
        'verifiedBotName' in botResult ? botResult.verifiedBotName : undefined;

      // Allow verified bots like ChatGPT Operator
      const isOperator = isVerifiedBot && verifiedBotName === 'chatgpt-operator';

      if (isBot && !isOperator) {
        return NextResponse.json({ error: 'Access denied: Bot detected' }, { status: 403 });
      }
    } catch (error) {
      // In development, we might fail if keys are missing but NODE_ENV didn't catch it.
      // Log warning but allow to proceed (fail open for dev sanity).
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'BotID check failed (likely missing keys), proceeding because in development mode:',
          error
        );
      } else {
        // In production, log error. We proceed to auth check (fail open) or block (fail closed).
        // Fail open is safer for business continuity if BotID service is down,
        // as we still have the Authorization check coming up.
        console.error('BotID check failed in production:', error);
      }
    }
  } else {
    console.log('Skipping BotID check (Development mode or no keys configured)');
  }

  // 3. Final Authorization Check
  // If we get here, the user is either a human, an allowed bot, or we skipped the check.
  // We still require valid authorization to perform the sensitive action.
  return runTokenRefresh(authorization, webhookSecret);
}

async function runTokenRefresh(authorization: string | null, webhookSecret: string | undefined) {
  if (!webhookSecret) {
    console.error('WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
  }

  // Double check auth (redundant for step 1, but needed for step 3)
  if (authorization !== `Bearer ${webhookSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized', receivedAuth: authorization ? '***' : null },
      { status: 401 }
    );
  }

  try {
    const result = await manualTokenRefresh();
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
