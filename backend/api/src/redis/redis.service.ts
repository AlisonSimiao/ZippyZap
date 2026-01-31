import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private static redisClient: Redis;
  private url: string;
  private readonly logger = new Logger(RedisService.name);

  onModuleInit() {
    if (RedisService.redisClient) return;

    const { REDIS_USER, REDIS_HOST, REDIS_PASS, REDIS_PORT } = process.env;

    RedisService.redisClient = new Redis({
      host: REDIS_HOST,
      password: REDIS_PASS,
      username: REDIS_USER,
      port: Number(REDIS_PORT),
    });

    RedisService.redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
      throw new Error('Redis connection error');
    });

    RedisService.redisClient.on('connect', () => {
      this.logger.log('Redis connected');
    });
  }

  get(key: string): Promise<string | null> {
    return RedisService.redisClient.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await RedisService.redisClient.set(key, value);
  }

  /**
   * Set a key with a value and an expiration time
   * @param key Key to set
   * @param value Value to set
   * @param expiration Expiration time in seconds
   * @returns 'OK' if the key was set
   */
  async setWithExpiration(
    key: string,
    value: string,
    expiration: number,
  ): Promise<'OK'> {
    return RedisService.redisClient.set(key, value, 'EX', expiration);
  }

  async publish(chanel: string, data: string) {
    return RedisService.redisClient.publish(chanel, data);
  }

  async delete(key: string): Promise<number> {
    return RedisService.redisClient.del(key);
  }

  async keys(pattern: string) {
    return RedisService.redisClient.keys(pattern);
  }

  async incr(key: string): Promise<number> {
    return RedisService.redisClient.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return RedisService.redisClient.expire(key, seconds);
  }

  /**
   * Increment a counter and set expiration atomically
   * @param key Key to increment
   * @param ttl TTL in seconds
   * @returns The new count after increment
   */
  async incrWithExpiry(key: string, ttl: number): Promise<number> {
    const pipeline = RedisService.redisClient.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, ttl);
    const results = await pipeline.exec();

    if (!results || results.length === 0) {
      throw new Error(`Failed to increment key: ${key}`);
    }

    // results[0] is [error, value] from INCR
    const incrResult = results[0];
    if (incrResult[0] !== null) {
      throw incrResult[0];
    }

    return incrResult[1] as number;
  }

  /**
   * Delete keys matching a pattern (use with caution)
   * @param pattern Redis key pattern (e.g., "apiKey:*")
   * @returns Number of keys deleted
   */
  async deletePattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) return 0;
    return RedisService.redisClient.del(...keys);
  }
}
