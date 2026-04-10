import { Elysia } from 'elysia';
import { prisma } from '../services/prisma';

export const requestLogMiddleware = new Elysia({ name: 'request-log' })
  .onRequest(async (ctx) => {
    ctx.set.headers['x-request-start'] = Date.now().toString();
  })
  .onAfterResponse(async (ctx) => {
    const startTime = parseInt(ctx.set.headers['x-request-start'] || '0', 10);
    if (!startTime) return;

    const responseTime = Date.now() - startTime;
    const path = ctx.request.url.split('?')[0];

    // Skip logging for health, metrics, and static paths
    if (path === '/health' || path === '/metrics' || path === '/') return;
    if (path.startsWith('/swagger') || path.startsWith('/favicon')) return;

    try {
      const userId = (ctx as any).user?.id || null;
      const responseStatus = ctx.set.status || 200;

      // Get relevant headers
      const headers: Record<string, string> = {};
      const authHeader = ctx.request.headers.get('authorization');
      if (authHeader) {
        headers['authorization'] = authHeader.startsWith('Bearer ') 
          ? 'Bearer [REDACTED]' 
          : authHeader;
      }
      headers['content-type'] = ctx.request.headers.get('content-type') || '';

      // Get body for POST/PUT/PATCH (limited size)
      let body: any = null;
      if (['POST', 'PUT', 'PATCH'].includes(ctx.request.method)) {
        try {
          const clone = ctx.request.clone();
          const text = await clone.text();
          if (text && text.length < 10000) {
            try {
              body = JSON.parse(text);
              // Remove sensitive fields
              if (body.password) body.password = '[REDACTED]';
              if (body.token) body.token = '[REDACTED]';
              if (body.apiKey) body.apiKey = '[REDACTED]';
            } catch {
              body = { _raw: text.substring(0, 500) };
            }
          }
        } catch {}
      }

      // Get IP
      const ip = 
        ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        ctx.request.headers.get('x-real-ip') ||
        ctx.request.headers.get('cf-connecting-ip') ||
        'unknown';

      // Get User Agent
      const userAgent = ctx.request.headers.get('user-agent') || null;

      // Get query string
      const url = new URL(ctx.request.url);
      const query = url.search || null;

      await prisma.requestLog.create({
        data: {
          userId,
          method: ctx.request.method,
          path: path.substring(0, 500),
          query: query?.substring(0, 2000) || null,
          body: body ? { ...body, _truncated: true } : null,
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