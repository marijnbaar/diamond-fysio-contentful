const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file
import { NextResponse } from 'next/server';

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

// Function to update the access token in the .env file
async function updateAccessTokenInEnv(longLivedAccessToken) {
  // Update .env file
  const envFilePath = '.env';
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const updatedEnvContent = envContent.replace(
    /^NEXT_PUBLIC_INSTAGRAM_API_KEY=.*/,
    `"NEXT_PUBLIC_INSTAGRAM_API_KEY=${longLivedAccessToken}"`
  );
  fs.writeFileSync(envFilePath, updatedEnvContent);
}

// Function to update Vercel environment variable
async function sendNewTokentoVercel(longLivedAccessToken) {
  try {
    const projectId = process.env.VERCEL_PROJECT_ID;
    const envId = process.env.ENV_ID;

    const body = {
      value: `${longLivedAccessToken}`
    };

    const result = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${envId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`
      }
    });

    if (!result.ok) {
      const errorData = await result.json();
      throw new Error(`Failed to update environment variable: ${errorData.error.message}`);
    }

    const data = await result.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' });
  }
}

// Function to load posts from Instagram API
export async function loadPosts() {
  // Call an external API endpoint to get posts
  let secret = process.env.NEXT_PUBLIC_INSTAGRAM_API_KEY;

  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp,media_type,permalink&access_token=${secret}`;
  const res = await fetch(url);
  const feed = await res.json();

  return feed;
}

// Scheduler function to run loadPosts every twenty days
async function scheduleLoadPosts() {
  const twentyDaysInMilliseconds = 20 * 24 * 60 * 60 * 1000; // 20 days in milliseconds

  async function checkAndLoadPosts() {
    const now = Date.now();
    const lastRun = parseInt(fs.readFileSync('.lastrun', 'utf8') || '0');
    if (now - lastRun >= twentyDaysInMilliseconds) {
      // Get the long-lived access token
      let secret = process.env.NEXT_PUBLIC_INSTAGRAM_API_KEY;

      let longLivedAccessToken = await refreshAccessToken(secret);

      await updateAccessTokenInEnv(longLivedAccessToken);
      await sendNewTokentoVercel(longLivedAccessToken);
      if (!longLivedAccessToken) {
        throw new Error('Failed to fetch long-lived access token');
      }
      fs.writeFileSync('.lastrun', now.toString());
    }

    // Schedule the next check
    setTimeout(checkAndLoadPosts, twentyDaysInMilliseconds);
  }

  checkAndLoadPosts();
}

// Start the scheduling
scheduleLoadPosts();
