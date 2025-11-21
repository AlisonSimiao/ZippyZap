import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private static redisClient: Redis;

  constructor() {
    RedisService.redisClient ??= new Redis({
      host: 'localhost',
      port: 6379,
      username: 'default',
      password: 'redis',
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
}
