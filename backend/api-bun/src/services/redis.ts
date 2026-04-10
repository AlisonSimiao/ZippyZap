import Redis from 'ioredis';

const { REDIS_HOST, REDIS_PASS, REDIS_USER, REDIS_PORT } = Bun.env;

export const redis = new Redis({
  host: REDIS_HOST || 'localhost',
  password: REDIS_PASS || undefined,
  username: REDIS_USER || undefined,
  port: Number(REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required for blocking commands (XREADGROUP)
  lazyConnect: false,
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Connected');
});

// ─── Helper Functions ───────────────────────────────────────────────

export async function redisGet(key: string): Promise<string | null> {
  return redis.get(key);
}

export async function redisSet(key: string, value: string): Promise<void> {
  await redis.set(key, value);
}

export async function redisSetWithExpiry(
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<'OK'> {
  return redis.set(key, value, 'EX', ttlSeconds);
}

export async function redisDel(key: string): Promise<number> {
  return redis.del(key);
}

export async function redisKeys(pattern: string): Promise<string[]> {
  return redis.keys(pattern);
}

export async function redisIncr(key: string): Promise<number> {
  return redis.incr(key);
}

export async function redisExpire(
  key: string,
  seconds: number,
): Promise<number> {
  return redis.expire(key, seconds);
}

/**
 * Increment a counter and set expiration atomically via pipeline
 */
export async function redisIncrWithExpiry(
  key: string,
  ttl: number,
): Promise<number> {
  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, ttl);
  const results = await pipeline.exec();

  if (!results || results.length === 0) {
    throw new Error(`Failed to increment key: ${key}`);
  }

  const incrResult = results[0];
  if (incrResult[0] !== null) {
    throw incrResult[0];
  }

  return incrResult[1] as number;
}

/**
 * Delete all keys matching a pattern
 */
export async function redisDeletePattern(pattern: string): Promise<number> {
  const keys = await redis.keys(pattern);
  if (keys.length === 0) return 0;
  return redis.del(...keys);
}

export async function redisPublish(
  channel: string,
  data: string,
): Promise<number> {
  return redis.publish(channel, data);
}
