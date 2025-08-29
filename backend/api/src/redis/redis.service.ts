import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private static redisClient: Redis;
  private url: string;
  private readonly logger = new Logger(RedisService.name);

  onModuleInit() {
    const { REDIS_USER, REDIS_HOST, REDIS_PASS, REDIS_PORT } = process.env;

    ['REDIS_HOST', 'REDIS_PORT'].forEach((envProp) => {
      if (!process.env[envProp]) {
        throw new Error(
          `Redis environment variables ${envProp} are not defined`,
        );
      }
    });

    const url = `${REDIS_USER}:${REDIS_PASS}@${REDIS_HOST}:${REDIS_PORT}`;
    this.logger.debug(url);
    RedisService.redisClient ??= new Redis({
      password: REDIS_PASS,
      username: REDIS_USER,
      host: REDIS_HOST,
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
}
