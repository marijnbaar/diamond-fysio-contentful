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
    const getEnvUrl = `${VERCEL_API_BASE}/${projectId}/env`;
    const envVars = await fetchWithErrorHandling(getEnvUrl, { headers });
    const existingVar = envVars.envs.find((env) => env.key === envName);

    if (!existingVar) {
      throw new Error('Environment variable not found');
    }

    const updateUrl = `${VERCEL_API_BASE}/${projectId}/env/${existingVar.id}`;
    const updateResult = await fetchWithErrorHandling(updateUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ value: longLivedAccessToken })
    });

    console.log('Vercel API response:', updateResult);
    return { success: true, data: updateResult };
  } catch (error) {
    console.error('Error in sendNewTokentoVercel:', error);
    return { success: false, error: error.message };
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
