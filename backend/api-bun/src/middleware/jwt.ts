import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { prisma } from '../services/prisma';

const PUBLIC_PATHS = ['/', '/plans', '/health', '/health/wuzapi', '/health/whatsapp-manager', '/swagger', '/payments/webhook'];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.includes(path) || 
    path.startsWith('/auth/') || 
    path.startsWith('/whatsapp') || 
    path.startsWith('/webhooks/wuzapi') ||
    path.startsWith('/webhooks/whatsapp-manager');
}

export const requestLogger = new Elysia({ name: 'request-logger' })
  .onRequest((ctx) => {
    (ctx as any).requestStart = Date.now();
  })
  .onAfterResponse(async (ctx) => {
    const startTime = (ctx as any).requestStart;
    if (!startTime) return;

    const responseTime = Date.now() - startTime;
    const url = new URL(ctx.request.url);
    const path = url.pathname;

    if (path === '/health' || path === '/metrics' || path === '/') return;
    if (path.startsWith('/swagger') || path.startsWith('/favicon')) return;
    if (path.startsWith('/auth/')) return;

    const userId = (ctx as any).user?.id || null;
    const responseStatus = ctx.set.status || 200;

    const ip = 
      ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      ctx.request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = ctx.request.headers.get('user-agent') || null;
    const query = url.search || null;

    try {
      await prisma.requestLog.create({
        data: {
          userId,
          method: ctx.request.method,
          path: path.substring(0, 500),
          query: query?.substring(0, 2000) || null,
          body: null,
          headers: {},
          responseStatus,
          responseTime,
          ip,
          userAgent,
        },
      });
      console.log('[REQUEST_LOG] Saved:', ctx.request.method, path, responseStatus);
    } catch (error) {
      console.error('Failed to save request log:', error);
    }
  });

export const authMiddleware = new Elysia({ name: 'auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: Bun.env.JWT_SECRET!,
    }),
  )
  .onRequest(async (ctx) => {
    if (ctx.request.method === 'OPTIONS') return;
    
    const url = new URL(ctx.request.url);
    const path = url.pathname;
    
    if (isPublicPath(path)) return;
    
    const auth = ctx.request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      ctx.set.status = 403;
      return;
    }
    
    const token = auth.slice(7);
    
    try {
      const payload: any = await ctx.jwt.verify(token);
      if (!payload?.id) {
        ctx.set.status = 403;
        return;
      }
      
      const user = await prisma.user.findUnique({
        where: { id: Number(payload.id) },
        select: { id: true, email: true, name: true, Plan: true },
      });
      
      if (!user) {
        ctx.set.status = 403;
        return;
      }
      
      (ctx as any).user = user;
    } catch {
      ctx.set.status = 403;
    }
  });