import { Elysia } from 'elysia';
import { prisma } from '../services/prisma';
import { redis } from '../services/redis';

export const healthRoutes = new Elysia({ prefix: '/health' }).get(
  '/',
  async () => {
    const checks: Record<string, string> = {};

    // Check Prisma/Database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    // Check Redis
    try {
      await redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');

    return {
      status: allOk ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    };
  },
);
