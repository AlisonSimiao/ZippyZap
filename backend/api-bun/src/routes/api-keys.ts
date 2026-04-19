import { Elysia, t } from 'elysia';
import { prisma } from '../services/prisma';
import { redisDel } from '../services/redis';
import { randomBytes } from 'crypto';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../types';

function generateToken(prefix = 'zzw-'): string {
  return prefix.concat(randomBytes(24).toString('base64'));
}

function encryptToken(token: string): string {
  const first = token.slice(0, 4);
  const last = token.slice(-4);
  return (
    first +
    Array(24 - (first.length + last.length))
      .fill('*')
      .join('') +
    last
  );
}

export const apiKeyRoutes = new Elysia({ prefix: '/api-keys' })
  // ─── Create API Key ────────────────────────────────────────────
  .post(
    '/',
    async (ctx: any) => {
      const user = ctx.user;
      if (!user) throw new ForbiddenException('Not authenticated');

      const token = generateToken();

      if (ctx.body.name) {
        const existing = await prisma.apiKey.findFirst({
          where: { name: ctx.body.name, userId: user.id },
        });
        if (existing) {
          throw new ConflictException(
            `Api key com nome '${ctx.body.name}' ja existe`,
          );
        }
      }

      await prisma.apiKey.create({
        data: {
          name: ctx.body.name || randomBytes(5).toString('base64'),
          hash: token,
          status: ctx.body.status || 'ACTIVE',
          userId: user.id,
        },
      });

      return { token };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    },
  )
  // ─── List API Keys ─────────────────────────────────────────────
  .get('/', async (ctx: any) => {
    const user = ctx.user;
    if (!user) throw new ForbiddenException('Not authenticated');

    const data = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        hash: true,
        id: true,
        status: true,
        name: true,
        createdAt: true,
      },
    });

    return data;
  })
  // ─── Update API Key ────────────────────────────────────────────
  .patch(
    '/:name',
    async (ctx: any) => {
      const user = ctx.user;
      const params = ctx.params;
      const body = ctx.body;
      if (!user) throw new ForbiddenException('Not authenticated');

      const apikey = await prisma.apiKey.findFirst({
        where: { name: params.name, userId: user.id },
        select: { id: true },
      });

      if (!apikey) {
        throw new NotFoundException(
          `Api key com nome '${params.name}' não existe`,
        );
      }

      if (body.name) {
        const conflict = await prisma.apiKey.findFirst({
          where: {
            id: { not: apikey.id },
            name: body.name,
            userId: user.id,
          },
          select: { id: true },
        });
        if (conflict) {
          throw new ConflictException(
            `Api key com nome '${body.name}' ja existe`,
          );
        }
      }

      let token: string | undefined;
      if (body.generateToken) {
        token = generateToken();
      }

      await prisma.apiKey.update({
        where: { id: apikey.id },
        data: {
          name: body.name,
          status: body.status,
          hash: token,
        },
      });

      return { token };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        status: t.Optional(t.String()),
        generateToken: t.Optional(t.Boolean()),
      }),
    },
  )
  // ─── Delete API Key ────────────────────────────────────────────
  .delete('/:name', async (ctx: any) => {
    const user = ctx.user;
    const params = ctx.params;
    if (!user) throw new ForbiddenException('Not authenticated');

    const apikey = await prisma.apiKey.findFirst({
      where: { name: params.name, userId: user.id },
      select: { id: true, hash: true },
    });

    if (!apikey) {
      throw new NotFoundException(
        `Api key com nome '${params.name}' não existe`,
      );
    }

    await prisma.apiKey.delete({ where: { id: apikey.id } });
    await redisDel(`api-key:${apikey.hash}`);

    return { success: true };
  });
