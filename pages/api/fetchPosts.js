import { cacheData, getCachedData } from '../../lib/cache.js';
import fs from 'fs';
import path from 'path';

const INSTAGRAM_API_BASE = 'https://graph.instagram.com/v21.0';
const VERCEL_API_BASE = 'https://api.vercel.com/v9/projects';

function getVercelProjectConfig() {
  // Try to read from .vercel/project.json first (from vercel link)
  const vercelConfigPath = path.join(process.cwd(), '.vercel', 'project.json');
  if (fs.existsSync(vercelConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
      if (config.projectId && config.orgId) {
        return { projectId: config.projectId, orgId: config.orgId };
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Fallback to environment variables
  const projectId = process.env.VERCEL_PROJECT_ID;
  const orgId = process.env.VERCEL_ORG_ID;

  if (projectId && orgId) {
    return { projectId, orgId };
  }

  return null;
}

export async function refreshAccessToken(secret) {
  const url = `${INSTAGRAM_API_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${secret}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token refresh failed: ${response.status} ${errorText}`);
      return null;
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
}

export async function sendNewTokentoVercel(longLivedAccessToken) {
  const config = getVercelProjectConfig();
  if (!config) {
    throw new Error(
      'Vercel project configuration not found. Run "vercel link" or set VERCEL_PROJECT_ID and VERCEL_ORG_ID'
    );
  }

  const { projectId, orgId } = config;
  const envName = 'NEXT_PUBLIC_INSTAGRAM_API_KEY';
  const headers = {
    Authorization: `Bearer ${process.env.VERCEL_NEWAUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };

  if (!process.env.VERCEL_NEWAUTH_TOKEN) {
    throw new Error('VERCEL_NEWAUTH_TOKEN environment variable not found');
  }

  try {
    // Vercel API requires orgId as query parameter when not using team context
    const getEnvUrl = `${VERCEL_API_BASE}/${projectId}/env?teamId=${orgId}`;
    const envVarsResponse = await fetch(getEnvUrl, { headers });

    if (!envVarsResponse.ok) {
      throw new Error(
        `Failed to fetch Vercel env vars: ${envVarsResponse.status} ${envVarsResponse.statusText}`
      );
    }

    const envVars = await envVarsResponse.json();
    const existingVar = envVars.envs?.find((env) => env.key === envName);

    if (!existingVar) {
      throw new Error(`Environment variable ${envName} not found in Vercel`);
    }

    const updateUrl = `${VERCEL_API_BASE}/${projectId}/env/${existingVar.id}?teamId=${orgId}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ value: longLivedAccessToken })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update Vercel env var: ${updateResponse.status} ${errorText}`);
    }

    const updateResult = await updateResponse.json();
    return updateResult;
  } catch (error) {
    console.error('[sendNewTokentoVercel] Error:', error);
    throw error;
  }
}

export async function loadPosts() {
  try {
    const cachedPosts = await getCachedData('instagram_posts');
    if (cachedPosts) return cachedPosts;
  } catch (error) {
    console.error('Failed to get cached posts:', error);
  }

  let secret = process.env.NEXT_PUBLIC_INSTAGRAM_API_KEY;
  if (!secret) {
    console.warn('Instagram API key not found');
    return { data: [] };
  }

  const url = `${INSTAGRAM_API_BASE}/me/media?fields=id,caption,media_url,timestamp,media_type,permalink&access_token=${secret}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error(`Instagram API call failed: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorData);

      // If 400 Bad Request or 401 Unauthorized, try to refresh token automatically
      if (response.status === 400 || response.status === 401) {
        // Check if it's a token parsing error (token is completely invalid)
        const isInvalidToken =
          errorData?.error?.code === 190 ||
          errorData?.error?.message?.includes('Cannot parse access token') ||
          errorData?.error?.message?.includes('Invalid OAuth access token');

        if (isInvalidToken) {
          console.error('Instagram access token is completely invalid or corrupted.');
          console.error('Cannot auto-refresh: Token must be manually regenerated.');
          console.error('To fix this:');
          console.error('1. Go to https://developers.facebook.com/apps/');
          console.error('2. Navigate to your Instagram app');
          console.error('3. Go to Instagram > Basic Display or Instagram Graph API');
          console.error('4. Generate a new long-lived access token');
          console.error('5. Update NEXT_PUBLIC_INSTAGRAM_API_KEY in Vercel with the new token');
        } else {
          // Token might be expired but still valid format - try to refresh
          const newToken = await refreshAccessToken(secret);

          if (newToken && newToken !== secret) {
            secret = newToken;

            // Retry with new token
            const retryUrl = `${INSTAGRAM_API_BASE}/me/media?fields=id,caption,media_url,timestamp,media_type,permalink&access_token=${newToken}`;
            const retryResponse = await fetch(retryUrl);

            if (retryResponse.ok) {
              const feed = await retryResponse.json();

              if (feed && feed.data && Array.isArray(feed.data)) {
                try {
                  await cacheData('instagram_posts', feed, 3600);
                } catch (cacheError) {
                  console.error('Failed to cache posts:', cacheError);
                }

                // Try to update Vercel env variable if credentials are available
                const vercelConfig = getVercelProjectConfig();
                if (vercelConfig && process.env.VERCEL_NEWAUTH_TOKEN) {
                  try {
                    await sendNewTokentoVercel(newToken);
                  } catch {
                    // Silent fail - token refresh will be retried next time
                  }
                }

                return feed;
              }
            } else {
              console.error(
                'Retry after token refresh also failed:',
                retryResponse.status,
                retryResponse.statusText
              );
            }
          } else {
            console.warn(
              'Token refresh failed or returned same token. Token may need manual refresh.'
            );
          }
        }
      }

      return { data: [] };
    }
    const feed = await response.json();

    // Check if feed has error
    if (feed.error) {
      console.error('Instagram API returned error:', feed.error);
      return { data: [] };
    }

    if (feed && feed.data && Array.isArray(feed.data)) {
      try {
        await cacheData('instagram_posts', feed, 3600); // Cache for 1 hour
      } catch (cacheError) {
        console.error('Failed to cache posts:', cacheError);
      }
      return feed;
    }
    return { data: [] };
  } catch (error) {
    console.error('Failed to load Instagram posts:', error);
    console.error('Error stack:', error.stack);
    return { data: [] };
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
