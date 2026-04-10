import { Elysia, t } from 'elysia';
import { prisma } from '../services/prisma';
import { BadRequestException, ForbiddenException } from '../types';

export const userRoutes = new Elysia({ prefix: '/users' })
  .patch(
    '/',
    async (ctx: any) => {
      const user = ctx.user;
      if (!user) throw new ForbiddenException('Not authenticated');

      if (ctx.body.webhookUrl) {
        await testWebhookUrl(ctx.body.webhookUrl);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: ctx.body.name,
          email: ctx.body.email,
          whatsapp: ctx.body.whatsapp,
          webhookUrl: ctx.body.webhookUrl,
          retentionDays: ctx.body.retentionDays,
        },
      });

      return { success: true };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String({ format: 'email' })),
        whatsapp: t.Optional(t.String()),
        webhookUrl: t.Optional(t.String()),
        retentionDays: t.Optional(t.Number()),
      }),
    },
  );

// ─── Webhook URL Validation ────────────────────────────────────────

async function testWebhookUrl(webhookUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(webhookUrl);
  } catch {
    throw new BadRequestException('URL inválida');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new BadRequestException('Apenas HTTP/HTTPS permitidos');
  }

  const hostname = url.hostname;
  const privateIpRegex =
    /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|localhost|0\.0\.0\.0)/;
  if (privateIpRegex.test(hostname)) {
    throw new BadRequestException('URLs internas não permitidas');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'TESTE',
        payload: { message: 'teste' },
      }),
      signal: controller.signal,
    });

    if (!res.ok || res.status !== 200) {
      throw new ForbiddenException('Webhook URL não respondeu corretamente');
    }
  } finally {
    clearTimeout(timeout);
  }
}
