import type { NextApiRequest, NextApiResponse } from 'next';
import { manualTokenRefresh } from '../../lib/api/fetchPosts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST and GET requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers.authorization;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // Authorization check - requires valid Bearer token
  if (!webhookSecret) {
    console.error('WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Server Configuration Error' });
  }

  if (authorization !== `Bearer ${webhookSecret}`) {
    return res.status(401).json({
      error: 'Unauthorized',
      receivedAuth: authorization ? '***' : null
    });
  }

  // Execute token refresh
  try {
    const result = await manualTokenRefresh();
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error in token refresh handler:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
