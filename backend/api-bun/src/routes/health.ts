import { Elysia } from 'elysia';
import { prisma } from '../services/prisma';
import { redis } from '../services/redis';
import { wuzapiClient } from '../services/wuzapi';
import { whatsappManagerClient } from '../services/whatsapp-manager';

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
  })
  .get('/whatsapp-manager', async () => {
    const checks: Record<string, string> = {};
    const BASE_URL = Bun.env.WHATSAPP_MANAGER_URL || 'http://localhost:8090';

    try {
      const response = await fetch(`${BASE_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      checks.whatsappManager = response.ok ? 'ok' : 'error';
    } catch {
      checks.whatsappManager = 'error';
    }

    checks.circuitBreaker = whatsappManagerClient.getCircuitState();

    const allOk = checks.whatsappManager === 'ok' && whatsappManagerClient.isHealthy();

    return {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  });
