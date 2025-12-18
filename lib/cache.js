/**
 * Simple in-memory cache with TTL.
 *
 * Note: this cache is per Node.js process and will not persist across serverless
 * invocations or deployments. It's still useful to reduce duplicate work within
 * a single runtime.
 */

/** @type {Map<string, { value: string, expiresAt?: number }>} */
const memoryStore = new Map();

function now() {
  return Date.now();
}

function getRaw(key) {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt <= now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function setRaw(key, value, ttlSeconds) {
  const expiresAt = typeof ttlSeconds === 'number' ? now() + ttlSeconds * 1000 : undefined;
  memoryStore.set(key, { value, expiresAt });
}

export async function cacheSet(key, value, opts) {
  setRaw(key, value, opts?.ex);
}

export async function cacheGet(key) {
  return getRaw(key);
}

export async function cacheMGet(keys) {
  if (!Array.isArray(keys) || keys.length === 0) return [];
  return keys.map((k) => getRaw(k));
}

export async function cacheData(key, data, ttl) {
  setRaw(key, JSON.stringify(data), ttl);
}

export async function getCachedData(key) {
  const val = getRaw(key);
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}
