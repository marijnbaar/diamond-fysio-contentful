import { kvSet, kvGet } from './kv.js';

export async function cacheData(key, data, ttl) {
  // @vercel/kv automatically serializes objects, so we pass the data directly
  await kvSet(key, data, { ex: ttl });
}

export async function getCachedData(key) {
  const val = await kvGet(key);
  // @vercel/kv automatically deserializes, so we return the value directly
  return val;
}
