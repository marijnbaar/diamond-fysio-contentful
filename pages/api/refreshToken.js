import { manualTokenRefresh } from './fetchPosts';

export default async function handler(req, res) {
  // Allow both GET and POST methods for debugging
  if (req.method === 'GET' || req.method === 'POST') {
    // Check for a secret key to ensure the webhook is authorized
    const { authorization } = req.headers;
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (authorization !== `Bearer ${webhookSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await manualTokenRefresh();
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error('Error in webhook handler:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
