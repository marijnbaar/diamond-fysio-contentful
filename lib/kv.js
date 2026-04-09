import { createClient } from '@vercel/kv';

// Use Vercel Storage KV environment variables
const kv = createClient({
  url: process.env.STORAGE_KV_REST_API_URL,
  token: process.env.STORAGE_KV_REST_API_TOKEN
});

function logKvError(operation, key, error) {
  console.error('[KV] Operation failed', {
    operation,
    key,
    error
  });
}

/**
 * Set a key-value pair in Vercel KV with optional expiration time
 * @param {string} key - The key to set
 * @param {string} value - The value to store
 * @param {Object} options - Options object
 * @param {number} options.ex - Expiration time in seconds
 */
export async function kvSet(key, value, options = {}) {
  try {
    if (options.ex) {
      // Set with expiration time (in seconds)
      await kv.set(key, value, { ex: options.ex });
    } else {
      // Set without expiration
      await kv.set(key, value);
    }
  } catch (error) {
    logKvError('set', key, error);
    // Don't throw - fail gracefully so app continues without cache
  }
}

/**
 * Get a value from Vercel KV
 * @param {string} key - The key to retrieve
 * @returns {Promise<string|null>} The value or null if not found
 */
export async function kvGet(key) {
  try {
    return await kv.get(key);
  } catch (error) {
    logKvError('get', key, error);
    // Return null on error so app continues without cached data
    return null;
  }
}
