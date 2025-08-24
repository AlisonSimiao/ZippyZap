import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private static redisClient: Redis;

  constructor() {
    RedisService.redisClient ??= new Redis({
      host: 'localhost',
      port: 6379,
    });

    console.log('Redis connected');
  }

  async get(key: string): Promise<string | null> {
    return RedisService.redisClient.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await RedisService.redisClient.set(key, value);
  }
}
