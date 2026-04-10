import { Elysia } from 'elysia';
import { jwt as jwtPluginFn } from '@elysiajs/jwt';
import { prisma } from '../services/prisma';

const PUBLIC_PATHS = ['/', '/plans', '/health', '/swagger', '/payments/webhook'];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.includes(path) || 
    path.startsWith('/auth/') || 
    path.startsWith('/whatsapp') || 
    path.startsWith('/webhooks/wuzapi');
}

export const jwtPlugin = new Elysia({ name: 'jwt-auth' })
  .use(
    jwtPluginFn({
      name: 'jwt',
      secret: Bun.env.JWT_SECRET!,
    }),
  );

export const authMiddleware = new Elysia({ name: 'auth' })
  .use(jwtPlugin)
  .onRequest(async (ctx) => {
    console.log('[AUTH] Request:', ctx.request.method, ctx.request.url);
    
    // Skip auth for OPTIONS (CORS preflight)
    if (ctx.request.method === 'OPTIONS') {
      console.log('[AUTH] Skipping OPTIONS');
      return;
    }
    
    const url = new URL(ctx.request.url);
    const path = url.pathname;
    
    if (isPublicPath(path)) {
      console.log('[AUTH] Skipping public path:', path);
      return;
    }
    
    const auth = ctx.request.headers.get('authorization');
    console.log('[AUTH] Auth header:', auth?.substring(0, 30));
    
    if (!auth?.startsWith('Bearer ')) {
      console.log('[AUTH] No Bearer token, returning 403');
      ctx.set.status = 403;
      return;
    }
    
    const token = auth.slice(7);
    
    try {
      const payload: any = await ctx.jwt.verify(token);
      console.log('[AUTH] Token verified, payload:', payload);
      
      if (!payload?.id) {
        ctx.set.status = 403;
        return;
      }
      
      const user = await prisma.user.findUnique({
        where: { id: Number(payload.id) },
        select: { id: true, email: true, name: true, Plan: true },
      });
      
      console.log('[AUTH] User:', user?.email);
      
      if (!user) {
        ctx.set.status = 403;
        return;
      }
      
      (ctx as any).user = user;
    } catch (e: any) {
      console.log('[AUTH] Error:', e.message);
      ctx.set.status = 403;
    }
  });