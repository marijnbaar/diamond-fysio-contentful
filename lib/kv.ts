import { kv as vercelKv } from '@vercel/kv';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

function hasVercelKv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getRedisClient(): Promise<RedisClient> {
  if (redisClient) return redisClient;
  const url =
    process.env.TRANSLATION_STORAGE_REDIS_URL ||
    process.env.KV_URL ||
    process.env.REDIS_URL ||
    process.env.UPSTASH_REDIS_URL;

  if (!url) {
    throw new Error(
      'No Redis URL available. Set TRANSLATION_STORAGE_REDIS_URL or KV_URL/REDIS_URL.'
    );
  }

  const client = createClient({ url });
  client.on('error', (err) => {
    console.error('[kv] Redis client error', { error: err?.message || err });
  });
  await client.connect();
  redisClient = client;
  return client;
}

export async function kvGet<T = string>(key: string): Promise<T | null> {
  if (hasVercelKv()) {
    return ((await vercelKv.get<T>(key)) as T | null) ?? null;
  }
  const client = await getRedisClient();
  const val = await client.get(key);
  return (val as unknown as T) ?? null;
}

export async function kvSet(key: string, value: string, opts?: { ex?: number }): Promise<void> {
  if (hasVercelKv()) {
    if (opts?.ex) {
      await vercelKv.set(key, value, { ex: opts.ex });
    } else {
      await vercelKv.set(key, value);
    }
    return;
  }
  const client = await getRedisClient();
  if (opts?.ex) {
    await client.set(key, value, { EX: opts.ex });
  } else {
    await client.set(key, value);
  }
}

export async function kvMGet(keys: string[]): Promise<(string | null)[]> {
  if (keys.length === 0) return [];
  if (hasVercelKv()) {
    // @vercel/kv supports mget
    const vals = await vercelKv.mget<unknown[]>(...(keys as any));
    return (vals as (string | null)[]) || [];
  }
  const client = await getRedisClient();
  // node-redis supports mGet
  const vals = await client.mGet(keys);
  return (vals as (string | null)[]) || [];
}

export async function kvPing(): Promise<string> {
  if (hasVercelKv()) {
    // @vercel/kv does not expose ping; do a lightweight set/get roundtrip key
    const probeKey = `kv:probe:${Date.now()}`;
    await vercelKv.set(probeKey, 'ok', { ex: 5 });
    const got = await vercelKv.get<string>(probeKey);
    return got ? 'PONG' : 'NOOP';
  }
  const client = await getRedisClient();
  return client.ping();
}
