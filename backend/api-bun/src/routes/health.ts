import { Elysia } from 'elysia';
import { prisma } from '../services/prisma';
import { redis } from '../services/redis';
import { wuzapiClient } from '../services/wuzapi';

export const healthRoutes = new Elysia({ prefix: '/health' })
  .get(
    '/',
    async () => {
      const checks: Record<string, string> = {};

      try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = 'ok';
      } catch {
        checks.database = 'error';
      }

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
  )
  .get('/wuzapi', async () => {
    const checks: Record<string, string> = {};

    try {
      const users = await wuzapiClient.getUsers();
      checks.wuzapi = Array.isArray(users) ? 'ok' : 'error';
    } catch {
      checks.wuzapi = 'error';
    }

    checks.circuitBreaker = wuzapiClient.getCircuitState();

    const allOk = checks.wuzapi === 'ok' && wuzapiClient.isHealthy();

    return {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  });
