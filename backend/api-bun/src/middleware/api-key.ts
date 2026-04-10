import { Elysia } from 'elysia';
import { prisma } from '../services/prisma';
import { redisGet, redisSetWithExpiry } from '../services/redis';
import { ForbiddenException, type ApiKeyContext } from '../types';
import { EStatusApiKey } from '@prisma/client';

/**
 * API Key middleware — replaces NestJS ApiKeyMiddleware
 *
 * Reads x-api-key header, checks Redis cache, falls back to Prisma.
 * Only applied to /whatsapp/* routes.
 */
export const apiKeyPlugin = new Elysia({ name: 'api-key-auth' }).derive(
  async ({ headers }) => {
    const hash = headers['x-api-key'] as string | undefined;

    if (!hash) {
      throw new ForbiddenException('apiKey not found');
    }

    // Try Redis cache first
    let apiKey: ApiKeyContext | null = null;
    const cached = await redisGet(`apiKey:${hash}`);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && 'id' in parsed && 'userId' in parsed) {
          apiKey = parsed as ApiKeyContext;
        }
      } catch {
        // Invalid cache, will fetch from DB
      }
    }

    if (!apiKey) {
      // Fetch from database
      const dbKey = await prisma.apiKey.findUnique({
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

      if (dbKey) {
        apiKey = dbKey as unknown as ApiKeyContext;

        // Cache for 3 hours
        await redisSetWithExpiry(
          `apiKey:${hash}`,
          JSON.stringify(apiKey),
          60 * 60 * 3,
        );
      }
    }

    if (!apiKey) {
      throw new ForbiddenException('Invalid API Key');
    }

    return {
      apiKey: {
        userId: apiKey.userId,
        hash: hash,
        Plan: apiKey.User.Plan,
      },
    };
  },
);
