import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private static redisClient: Redis;

  constructor() {
    RedisService.redisClient ??= new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      username: process.env.REDIS_USER || 'default',
      password: process.env.REDIS_PASS || undefined,
    });

    RedisService.redisClient.on('error', (error) => {
      console.error('Redis error:', error);
    });

    RedisService.redisClient.on('connect', () => {
      console.log('Redis connected');
    });
  }

  async get(key: string): Promise<string | null> {
    return RedisService.redisClient.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await RedisService.redisClient.set(key, value);
  }

  async publish(chanel: string, data: string) {
    return RedisService.redisClient.publish(chanel, data);
  }

  async del(key: string) {
    return RedisService.redisClient.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return RedisService.redisClient.keys(pattern);
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
}
