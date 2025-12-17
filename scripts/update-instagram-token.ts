#!/usr/bin/env tsx
/**
 * Script to update Instagram token in Vercel
 * Usage:
 *   - Update with new token: npm run instagram:token:update -- --token=<NEW_TOKEN>
 *   - Try to refresh existing token: npm run instagram:token:refresh
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const INSTAGRAM_API_BASE = 'https://graph.instagram.com/v21.0';
const VERCEL_API_BASE = 'https://api.vercel.com/v9/projects';

function getVercelProjectConfig(): { projectId: string; orgId: string } | null {
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

async function refreshAccessToken(secret: string): Promise<string | null> {
  const url = `${INSTAGRAM_API_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${secret}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token refresh failed: ${response.status} ${errorText}`);
      return null;
    }
    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
}

async function sendNewTokentoVercel(longLivedAccessToken: string) {
  const config = getVercelProjectConfig();
  if (!config) {
    throw new Error(
      'Vercel project configuration not found. Run "vercel link" or set VERCEL_PROJECT_ID and VERCEL_ORG_ID'
    );
  }

  const { projectId, orgId } = config;
  const envName = 'INSTAGRAM_API_KEY';
  const headers = {
    Authorization: `Bearer ${process.env.VERCEL_NEWAUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };

  if (!process.env.VERCEL_NEWAUTH_TOKEN) {
    throw new Error('VERCEL_NEWAUTH_TOKEN environment variable not found');
  }

  // Vercel API requires orgId as query parameter when not using team context
  const getEnvUrl = `${VERCEL_API_BASE}/${projectId}/env?teamId=${orgId}`;
  const envVarsResponse = await fetch(getEnvUrl, { headers });

  if (!envVarsResponse.ok) {
    throw new Error(
      `Failed to fetch Vercel env vars: ${envVarsResponse.status} ${envVarsResponse.statusText}`
    );
  }

  const envVars: any = await envVarsResponse.json();
  const existingVar = envVars.envs?.find((env: any) => env.key === envName);

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

  return await updateResponse.json();
}

async function updateTokenInVercel(newToken: string) {
  const config = getVercelProjectConfig();

  if (!config) {
    console.error('❌ Vercel project configuration not found');
    console.error('   Please either:');
    console.error('   1. Run "vercel link" to link your project');
    console.error('   2. Or set VERCEL_PROJECT_ID and VERCEL_ORG_ID in your .env file');
    process.exit(1);
  }

  if (!process.env.VERCEL_NEWAUTH_TOKEN) {
    console.error('❌ VERCEL_NEWAUTH_TOKEN environment variable not found');
    console.error('   Please set this in your .env file or environment');
    process.exit(1);
  }

  try {
    console.log('🔄 Updating Instagram token in Vercel...');
    const result = await sendNewTokentoVercel(newToken);
    console.log('✅ Token successfully updated in Vercel!');
    console.log('   Please redeploy your Vercel project for changes to take effect.');
    return result;
  } catch (error: any) {
    console.error('❌ Failed to update token in Vercel:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const tokenArg = args.find((arg) => arg.startsWith('--token='));
  const token = tokenArg ? tokenArg.split('=')[1] : null;
  const shouldRefresh = args.includes('--refresh');

  if (token) {
    // Direct update with new token
    console.log('📝 Updating Vercel with new token...');
    await updateTokenInVercel(token);
  } else if (shouldRefresh) {
    // Try to refresh existing token
    const currentToken = process.env.INSTAGRAM_API_KEY;
    if (!currentToken) {
      console.error('❌ INSTAGRAM_API_KEY not found');
      console.error('   Use --token=<NEW_TOKEN> to set a new token directly');
      process.exit(1);
    }

    console.log('🔄 Attempting to refresh Instagram token...');
    const newToken = await refreshAccessToken(currentToken);

    if (newToken && newToken !== currentToken) {
      console.log('✅ Token refreshed successfully!');
      await updateTokenInVercel(newToken);
    } else {
      console.error('❌ Token refresh failed');
      console.error('   The current token may be completely invalid.');
      console.error('   Please get a new token from https://developers.facebook.com/apps/');
      console.error('   Then run: tsx scripts/update-instagram-token.ts --token=<NEW_TOKEN>');
      process.exit(1);
    }
  } else {
    console.log('Usage:');
    console.log('  Update with new token:');
    console.log('    tsx scripts/update-instagram-token.ts --token=<NEW_TOKEN>');
    console.log('');
    console.log('  Try to refresh existing token:');
    console.log('    tsx scripts/update-instagram-token.ts --refresh');
    console.log('');
    console.log('Environment variables needed:');
    console.log('  - VERCEL_NEWAUTH_TOKEN');
    console.log('  - INSTAGRAM_API_KEY (for --refresh)');
    console.log('');
    console.log('Or run "vercel link" to create .vercel/project.json');
    console.log('(which contains VERCEL_PROJECT_ID and VERCEL_ORG_ID)');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
