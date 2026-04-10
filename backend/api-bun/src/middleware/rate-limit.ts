import { redis } from '../services/redis';
import { TooManyRequestsException } from '../types';

/**
 * Rate limiter — replaces NestJS @nestjs/throttler + CustomThrottlerGuard
 *
 * Simple sliding window rate limiter using Redis INCR + EXPIRE.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  ttlMs: number,
): Promise<void> {
  const key = `ratelimit:${identifier}`;
  const ttlSeconds = Math.ceil(ttlMs / 1000);

  const current = await redis.incr(key);

  if (current === 1) {
    // First request, set expiration
    await redis.expire(key, ttlSeconds);
  }

  if (current > limit) {
    throw new TooManyRequestsException(
      `Rate limit exceeded. Try again later.`,
    );
  }
}

/**
 * Build a rate limit identifier from IP + path
 */
export function rateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}
