/**
 * BotID Protection Utility
 *
 * This utility provides bot protection for API routes and frontend forms.
 * BotID blocks automated bots while allowing real users through.
 */

const BOTID_API_URL = process.env.BOTID_API_URL || 'https://api.botid.com';
const BOTID_SECRET_KEY = process.env.BOTID_SECRET_KEY;

/**
 * Verify a BotID token on the server side
 * @param {string} token - The BotID token from the client
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function verifyBotIDToken(token) {
  if (!BOTID_SECRET_KEY) {
    console.warn('BOTID_SECRET_KEY not configured. BotID protection is disabled.');
    // In development, you might want to allow requests without token
    if (process.env.NODE_ENV === 'development') {
      return { valid: true };
    }
    return { valid: false, error: 'BotID not configured' };
  }

  if (!token) {
    return { valid: false, error: 'Missing BotID token' };
  }

  try {
    const response = await fetch(`${BOTID_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BOTID_SECRET_KEY}`
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { valid: false, error: error.message || 'BotID verification failed' };
    }

    const data = await response.json();
    return { valid: data.valid === true, score: data.score };
  } catch (error) {
    console.error('BotID verification error:', error);
    return { valid: false, error: 'BotID verification service unavailable' };
  }
}

/**
 * Middleware to protect API routes with BotID
 * @param {Function} handler - The API route handler
 * @param {Object} options - Options for the middleware
 * @param {boolean} options.skipIfAuthenticated - Skip BotID if route has its own auth (Bearer token, etc.)
 * @returns {Function} Protected handler
 */
export function withBotIDProtection(handler, options = {}) {
  const { skipIfAuthenticated = false } = options;

  return async (req, res) => {
    // Skip BotID check for webhooks (they have their own authentication)
    const isWebhook = req.url?.includes('/webhooks/');

    // Skip if route has its own authentication (e.g., Bearer token)
    const hasOwnAuth =
      skipIfAuthenticated &&
      (req.headers.authorization?.startsWith('Bearer ') ||
        req.headers['x-webhook-secret'] ||
        req.headers['x-contentful-webhook-secret']);

    if (!isWebhook && !hasOwnAuth) {
      const token = req.headers['x-botid-token'] || req.body?.botidToken;

      if (!token) {
        return res.status(400).json({
          error: 'BotID token required',
          message: 'Please include BotID token in x-botid-token header or botidToken in body'
        });
      }

      const verification = await verifyBotIDToken(token);

      if (!verification.valid) {
        return res.status(403).json({
          error: 'Bot verification failed',
          message: verification.error || 'Request blocked by BotID'
        });
      }
    }

    return handler(req, res);
  };
}

/**
 * Get BotID public key for frontend
 * @returns {string}
 */
export function getBotIDPublicKey() {
  return process.env.NEXT_PUBLIC_BOTID_PUBLIC_KEY || '';
}
