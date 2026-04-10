import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { prisma } from './services/prisma';
import { redis } from './services/redis';

// Routes
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { whatsappRoutes } from './routes/whatsapp';
import { apiKeyRoutes } from './routes/api-keys';
import { paymentRoutes } from './routes/payments';
import { webhookRoutes } from './routes/webhooks';
import { dashboardRoutes } from './routes/dashboard';
import { healthRoutes } from './routes/health';
import { planRoutes } from './routes/plans';

import { authMiddleware } from './middleware/jwt';
import { requestLogMiddleware } from './middleware/request-log';

export function createApp() {
  const app = new Elysia()
    .use(requestLogMiddleware)
    .use(
      cors({
        origin: '*',
        methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
        headers: 'Content-Type, Authorization',
        credentials: true,
      }),
    )
    .use(authMiddleware)
    .use(
      swagger({
        documentation: {
          info: {
            title: 'ZippyZap API',
            version: '2.0.0',
            description: 'WhatsApp Business API - Powered by Bun + Elysia',
          },
        },
      }),
    )
    // ─── Global state (accessible via context) ─────────────────────
    .decorate('prisma', prisma)
    .decorate('redis', redis)
    // ─── Global error handler ──────────────────────────────────────
    .onError(({ code, error, set }) => {
      if (code === 'VALIDATION') {
        set.status = 422;
        return {
          statusCode: 422,
          message: 'Validation failed',
          errors: error.message,
        };
      }

      if (code === 'NOT_FOUND') {
        set.status = 404;
        return { statusCode: 404, message: 'Route not found' };
      }

      // Generic errors
      const statusCode =
        typeof (error as any).statusCode === 'number'
          ? (error as any).statusCode
          : 500;
      set.status = statusCode;
      return {
        statusCode,
        message: (error as any)?.message || 'Internal Server Error',
      };
    })
    // ─── Routes ────────────────────────────────────────────────────
    .use(healthRoutes)
    .use(planRoutes)
    .use(authRoutes)
    .use(userRoutes)
    .use(whatsappRoutes)
    .use(apiKeyRoutes)
    .use(paymentRoutes)
    .use(webhookRoutes)
    .use(dashboardRoutes)
    // ─── Root ──────────────────────────────────────────────────────
    .get('/', () => ({
      name: 'ZippyZap API',
      version: '2.0.0',
      runtime: 'Bun',
    }));

  return app;
}
