import { Elysia } from 'elysia';
import { prisma } from '../services/prisma';

export const requestLogMiddleware = new Elysia({ name: 'request-log' })
  .derive(async (ctx) => {
    return {
      requestStart: Date.now()
    };
  })
  .afterHandle(async (ctx) => {
    const startTime = (ctx as any).requestStart;
    if (!startTime) return;

    const responseTime = Date.now() - startTime;
    const url = new URL(ctx.request.url);
    const path = url.pathname;

    // Skip logging for health, metrics, and static paths
    if (path === '/health' || path === '/metrics' || path === '/') return;
    if (path.startsWith('/swagger') || path.startsWith('/favicon')) return;
    if (path.startsWith('/auth/')) return; // Don't log auth routes

    try {
      const userId = (ctx as any).user?.id || null;
      const responseStatus = ctx.set.status || 200;

      // Get headers (redacted)
      const headers: Record<string, string> = {};
      const authHeader = ctx.request.headers.get('authorization');
      if (authHeader) {
        headers['authorization'] = 'Bearer [REDACTED]';
      }
      headers['content-type'] = ctx.request.headers.get('content-type') || '';

      // Get IP
      const ip = 
        ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        ctx.request.headers.get('x-real-ip') ||
        ctx.request.headers.get('cf-connecting-ip') ||
        'unknown';

      const userAgent = ctx.request.headers.get('user-agent') || null;
      const query = url.search || null;

      await prisma.requestLog.create({
        data: {
          userId,
          method: ctx.request.method,
          path: path.substring(0, 500),
          query: query?.substring(0, 2000) || null,
          body: null,
          headers,
          responseStatus,
          responseTime,
          ip,
          userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to save request log:', error);
    }
  });