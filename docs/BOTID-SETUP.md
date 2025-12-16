# BotID Setup Guide

This guide explains how to set up and use BotID protection in your Vercel project.

## Overview

BotID protection has been implemented in three main components:

1. **Server-side middleware** (`lib/botid.js`) - Protects API routes
2. **Client-side utility** (`lib/botid-client.js`) - Generates BotID tokens in the browser
3. **Frontend integration** - BotID script loaded in `_document.js` and integrated into contact forms

## Environment Variables

Add these environment variables to your Vercel project:

```bash
# BotID API Configuration
BOTID_SECRET_KEY=your_botid_secret_key_here
BOTID_API_URL=https://api.botid.com  # Optional, defaults to this

# Public key for frontend (safe to expose)
NEXT_PUBLIC_BOTID_PUBLIC_KEY=your_botid_public_key_here
```

### Setting up in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the variables above for all environments (Production, Preview, Development)

## Implementation Details

### 1. API Route Protection

API routes are protected using the `withBotIDProtection` middleware:

```javascript
import { withBotIDProtection } from '../../lib/botid.js';

async function handler(req, res) {
  // Your route logic
}

// Wrap with BotID protection
export default withBotIDProtection(handler);
```

**Options:**

- `skipIfAuthenticated: true` - Skip BotID check if route has its own authentication (Bearer token, etc.)

**Example:**

```javascript
export default withBotIDProtection(handler, { skipIfAuthenticated: true });
```

**Protected Routes:**

- `/api/refreshToken` - Protected (skips if Bearer token auth is present)
- `/api/webhooks/*` - Automatically exempt (webhooks have their own auth)

### 2. Frontend Integration

The BotID script is automatically loaded in `_document.js` when `NEXT_PUBLIC_BOTID_PUBLIC_KEY` is set.

**Contact Form Integration:**
The contact form (`components/Contact/Contactform.jsx`) automatically:

- Initializes BotID on component mount
- Includes BotID token in form submissions

### 3. Client-side Usage

To use BotID in other components:

```javascript
import { getBotIDToken } from '../../lib/botid-client';

async function submitForm() {
  const token = await getBotIDToken();

  const response = await fetch('/api/your-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-botid-token': token
    },
    body: JSON.stringify({
      /* your data */
    })
  });
}
```

## How It Works

1. **Frontend**: When a user visits your site, the BotID script analyzes their browser behavior
2. **Token Generation**: When a form is submitted or API call is made, BotID generates a token
3. **Token Verification**: The token is sent to your API route in the `x-botid-token` header
4. **Server Validation**: The server verifies the token with BotID's API
5. **Request Processing**: If valid, the request proceeds; if invalid (bot detected), it's blocked

## Testing

### Development Mode

In development, if `BOTID_SECRET_KEY` is not set, BotID protection will be disabled (requests will pass through). This allows local development without BotID credentials.

### Production Testing

1. Ensure all environment variables are set in Vercel
2. Submit a form or make an API call
3. Check browser console for BotID initialization
4. Check server logs for BotID verification results

## Troubleshooting

### BotID token not being generated

- Check that `NEXT_PUBLIC_BOTID_PUBLIC_KEY` is set correctly
- Check browser console for errors
- Verify the BotID script is loading: check Network tab for `botid.js`

### API requests being blocked

- Verify `BOTID_SECRET_KEY` is set correctly
- Check that the token is being sent in the `x-botid-token` header
- Review server logs for BotID verification errors
- Ensure `BOTID_API_URL` is correct if using a custom endpoint

### Webhooks failing

- Webhooks are automatically exempt from BotID protection
- They should continue using their existing authentication (Bearer tokens, webhook secrets, etc.)

## Additional Resources

- [BotID Documentation](https://vercel.com/docs/security/botid)
- [BotID Dashboard](https://vercel.com/dashboard)

## Notes

- BotID protection is optional for routes with existing authentication (Bearer tokens, webhook secrets)
- The contact form submits to Formspree, so BotID token is included for tracking but validation happens on your own API routes
- Consider creating a wrapper API route for form submissions if you want to validate BotID before forwarding to Formspree
