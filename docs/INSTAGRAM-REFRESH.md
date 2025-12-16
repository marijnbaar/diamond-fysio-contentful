# Instagram Token Refresh Logic

## Overview

This project includes an automated system to keep the Instagram Long-Lived Access Token valid. Instagram tokens expire after 60 days, so we have a system to refresh them automatically before they expire.

## How It Works

1.  **Token Refresh Endpoint (`app/api/refreshToken/route.ts`)**:
    - This API endpoint is designed to be called by a cron job (e.g., GitHub Actions, Vercel Cron, or an external cron service).
    - It calls `manualTokenRefresh()` from `pages/api/fetchPosts.js`.

2.  **Core Logic (`pages/api/fetchPosts.js`)**:
    - `refreshAccessToken(secret)`: Calls the Instagram Graph API (`refresh_access_token`) to exchange the current token for a new one.
    - `sendNewTokentoVercel(longLivedAccessToken)`: If hosted on Vercel, this function uses the Vercel API to update the `NEXT_PUBLIC_INSTAGRAM_API_KEY` environment variable with the new token. This ensures the next deployment or server restart picks up the new token.

3.  **Bot Protection**:
    - The `refreshToken` endpoint is protected by **BotID**.
    - It blocks automated bot traffic _unless_ the request includes a valid `Authorization: Bearer <WEBHOOK_SECRET>` header.
    - Your cron job **must** include this header to bypass the bot check.

## Setup

1.  **Environment Variables**:
    - `NEXT_PUBLIC_INSTAGRAM_API_KEY`: The current Instagram Access Token.
    - `WEBHOOK_SECRET`: A secret key used to authenticate the cron job.
    - `VERCEL_PROJECT_ID`: (Optional, auto-detected if linked) Vercel Project ID.
    - `VERCEL_ORG_ID`: (Optional, auto-detected if linked) Vercel Org ID.
    - `VERCEL_NEWAUTH_TOKEN`: A Vercel Personal Access Token with permissions to update environment variables.

2.  **Cron Job Example (curl)**:
    ```bash
    curl -X POST https://your-domain.com/api/refreshToken \
      -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
    ```

## Troubleshooting

- **Token Invalid**: If the token is completely invalid (e.g., user changed password), the refresh will fail. You must manually generate a new token via the Facebook Developers Portal and update the environment variable in Vercel.
- **Vercel Update Failed**: Check if `VERCEL_NEWAUTH_TOKEN` is valid and has the correct permissions.
