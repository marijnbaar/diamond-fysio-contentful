import { cacheData, getCachedData } from '../../lib/cache.js';

const INSTAGRAM_API_BASE = 'https://graph.instagram.com';
const VERCEL_API_BASE = 'https://api.vercel.com/v9/projects';

async function fetchWithErrorHandling(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
}

async function refreshAccessToken(secret) {
  const url = `${INSTAGRAM_API_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${secret}`;
  try {
    const data = await fetchWithErrorHandling(url);
    return data.access_token;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
}

async function sendNewTokentoVercel(longLivedAccessToken) {
  const projectId = process.env.VERCEL_PROJECT_ID;
  const envName = 'NEXT_PUBLIC_INSTAGRAM_API_KEY';
  const headers = {
    Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('[sendNewTokentoVercel] Starting...');
    console.log('[sendNewTokentoVercel] projectId:', projectId);
    console.log('[sendNewTokentoVercel] envName:', envName);

    const getEnvUrl = `${VERCEL_API_BASE}/${projectId}/env`;
    console.log('[sendNewTokentoVercel] getEnvUrl:', getEnvUrl);

    const envVars = await fetchWithErrorHandling(getEnvUrl, { headers });
    console.log('[sendNewTokentoVercel] envVars:', envVars);

    const existingVar = envVars.envs.find((env) => env.key === envName);
    if (!existingVar) {
      console.error('[sendNewTokentoVercel] Variable not found:', envName);
      throw new Error('Environment variable not found');
    }

    console.log('[sendNewTokentoVercel] found existingVar ID:', existingVar.id);

    const updateUrl = `${VERCEL_API_BASE}/${projectId}/env/${existingVar.id}`;
    console.log('[sendNewTokentoVercel] updateUrl:', updateUrl);

    const updateResult = await fetchWithErrorHandling(updateUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ value: longLivedAccessToken })
    });
    console.log('[sendNewTokentoVercel] updateResult:', updateResult);

    return updateResult;
  } catch (error) {
    console.error('[sendNewTokentoVercel] Error:', error);
    throw error;
  }
}

export async function loadPosts() {
  const cachedPosts = await getCachedData('instagram_posts');
  if (cachedPosts) return cachedPosts;

  const secret = process.env.NEXT_PUBLIC_INSTAGRAM_API_KEY;
  const url = `${INSTAGRAM_API_BASE}/me/media?fields=id,caption,media_url,timestamp,media_type,permalink&access_token=${secret}`;

  try {
    const feed = await fetchWithErrorHandling(url);
    await cacheData('instagram_posts', feed, 3600); // Cache for 1 hour
    return feed;
  } catch (error) {
    console.error('Failed to load posts:', error);
    return null;
  }
}

export async function manualTokenRefresh() {
  try {
    const secret = process.env.NEXT_PUBLIC_INSTAGRAM_API_KEY;
    console.log('Refreshing access token...');
    const longLivedAccessToken = await refreshAccessToken(secret);

    if (!longLivedAccessToken) {
      throw new Error('Failed to fetch long-lived access token');
    }

    console.log('Sending new token to Vercel...');
    const vercelResponse = await sendNewTokentoVercel(longLivedAccessToken);

    return {
      success: true,
      message: 'Token refresh process completed',
      vercelUpdate: vercelResponse
    };
  } catch (error) {
    console.error('Error in manualTokenRefresh:', error);
    return {
      success: false,
      message: error.message,
      error: error.stack
    };
  }
}
