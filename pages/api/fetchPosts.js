// Function to refresh the access token
async function refreshAccessToken(secret) {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${secret}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }
    const responseData = await response.json();
    const longLivedAccessToken = responseData.access_token;

    return longLivedAccessToken;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Function to update Vercel environment variable
async function sendNewTokentoVercel(longLivedAccessToken) {
  try {
    const projectId = process.env.VERCEL_PROJECT_ID;
    const envName = 'NEXT_PUBLIC_INSTAGRAM_API_KEY';

    console.log('Updating Vercel environment variable...');
    console.log('Project ID:', projectId);

    // First, get the existing environment variables
    const getEnvUrl = `https://api.vercel.com/v9/projects/${projectId}/env`;
    const getEnvResult = await fetch(getEnvUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getEnvResult.ok) {
      throw new Error('Failed to fetch existing environment variables');
    }

    const envVars = await getEnvResult.json();
    const existingVar = envVars.envs.find((env) => env.key === envName);

    if (!existingVar) {
      throw new Error('Environment variable not found');
    }

    // Now update the existing variable
    const updateUrl = `https://api.vercel.com/v9/projects/${projectId}/env/${existingVar.id}`;
    const updateResult = await fetch(updateUrl, {
      method: 'PATCH',
      body: JSON.stringify({ value: longLivedAccessToken }),
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Vercel API response status:', updateResult.status);
    console.log('Vercel API response status text:', updateResult.statusText);

    const responseData = await updateResult.json();
    console.log('Vercel API response data:', responseData);

    if (!updateResult.ok) {
      throw new Error(
        `Failed to update environment variable: ${responseData.error?.message || 'Unknown error'}`
      );
    }

    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    console.error('Error in sendNewTokentoVercel:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to load posts from Instagram API
import { cacheData, getCachedData } from '../../lib/cache';

export async function loadPosts() {
  const cachedPosts = await getCachedData('instagram_posts');
  if (cachedPosts) return cachedPosts;

  let secret = process.env.NEXT_PUBLIC_INSTAGRAM_API_KEY;
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp,media_type,permalink&access_token=${secret}`;
  const res = await fetch(url);
  const feed = await res.json();

  await cacheData('instagram_posts', feed, 3600); // Cache for 1 hour
  return feed;
}

// New function to manually trigger token refresh (for testing)
export async function manualTokenRefresh() {
  try {
    let secret = process.env.NEXT_PUBLIC_INSTAGRAM_API_KEY;
    console.log('Refreshing access token...');
    let longLivedAccessToken = await refreshAccessToken(secret);

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
