import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { EStatusApiKey } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

interface CachedApiKey {
  id: number;
  userId: number;
  User: {
    Plan: any;
  };
}

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async use(
    req: Request & { apiKey: CachedApiKey },
    res: Response,
    next: () => void,
  ) {
    const hash = req.headers['x-api-key'] as string;

    if (!hash) throw new ForbiddenException('apiKey not found');

    let apiKey = await this.redis
      .get(`apiKey:${hash}`)
      .then((json: string): CachedApiKey | null => {
        if (!json) return null;
        try {
          const parsed = JSON.parse(json) as unknown;
          if (
            parsed &&
            typeof parsed === 'object' &&
            parsed !== null &&
            'id' in parsed &&
            'userId' in parsed
          ) {
            return parsed as CachedApiKey;
          }
        } catch {
          return null;
        }
        return null;
      });

    if (!apiKey) {
      apiKey = await this.prisma.apiKey.findUnique({
        where: {
          hash,
          status: EStatusApiKey.ACTIVE,
        },
        select: {
          id: true,
          userId: true,
          User: {
            select: {
              Plan: true,
            },
          },
        },
      });

      await this.redis.setWithExpiration(
        `apiKey:${hash}`,
        JSON.stringify(apiKey),
        60 * 60 * 3,
      );
    }

    if (!apiKey) throw new ForbiddenException();

    req.apiKey = apiKey;

    next();
  }
}
