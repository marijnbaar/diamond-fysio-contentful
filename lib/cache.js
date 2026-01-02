import { kvSet, kvGet } from './kv.js';

export async function cacheData(key, data, ttl) {
  await kvSet(key, JSON.stringify(data), { ex: ttl });
}

export async function getCachedData(key) {
  const val = await kvGet(key);
  if (val) {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return null;
}
