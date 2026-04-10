import { Elysia, t } from 'elysia';
import { prisma } from '../services/prisma';
import {
  redisGet,
  redisIncrWithExpiry,
  redisSet,
  redisDel,
} from '../services/redis';
import { apiKeyPlugin } from '../middleware/api-key';
import { checkPlanLimits } from '../middleware/plan-limit';
import { checkRateLimit, rateLimitKey } from '../middleware/rate-limit';
import { addJob } from '../streams/producer';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '../types';
import { format } from 'date-fns';

export const whatsappRoutes = new Elysia({ prefix: '/whatsapp' })
  .use(apiKeyPlugin)
  // ─── Send Message ──────────────────────────────────────────────
  .post(
    '/',
    async ({ body, apiKey, request }) => {
      const ip =
        request.headers.get('x-forwarded-for') || 'unknown';
      await checkRateLimit(rateLimitKey(ip, '/whatsapp'), 100, 60000);

      const userId = apiKey.userId.toString();

      // Check plan limits
      await checkPlanLimits(
        apiKey.userId,
        apiKey.Plan.dailyLimit,
        apiKey.Plan.monthlyLimit,
      );

      // Check connected status
      const status = await redisGet(`user:${userId}:status`);
      if (status !== 'connected') {
        throw new BadRequestException('User not connected to WhatsApp');
      }

      const phone = body.to.replace(/\D/g, '');

      // Add to stream
      await addJob('streams:send-message', {
        idUser: userId,
        telefone: phone,
        text: body.message,
      });

      // Increment usage counters
      const today = format(new Date(), 'yyyy-MM-dd');
      const month = format(new Date(), 'yyyy-MM');
      await redisIncrWithExpiry(`usage:daily:${userId}:${today}`, 86400 * 2);
      await redisIncrWithExpiry(
        `usage:monthly:${userId}:${month}`,
        86400 * 35,
      );

      return { message: 'Mensagem enviada para a fila' };
    },
    {
      body: t.Object({
        to: t.String(),
        message: t.String(),
      }),
    },
  )
  // ─── Get QR Code ───────────────────────────────────────────────
  .get('/qrcode', async ({ apiKey, request }) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await checkRateLimit(rateLimitKey(ip, '/whatsapp/qrcode'), 500, 60000);

    const userId = apiKey.userId.toString();
    const qrData = await redisGet(`user:${userId}:qrcode`);

    if (!qrData) {
      throw new NotFoundException(
        'QR code not found. Tenha certeza que já usou a rota de criar sessão.',
      );
    }

    let qrBase64: string;
    try {
      const parsed = JSON.parse(qrData);
      qrBase64 = parsed.qr;
    } catch {
      qrBase64 = qrData;
    }

    const userStatus = (await redisGet(`user:${userId}:status`)) || '';

    return { status: userStatus, qr: qrBase64 };
  })
  // ─── Create Session ────────────────────────────────────────────
  .post('/session', async ({ apiKey, headers, request }) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await checkRateLimit(rateLimitKey(ip, '/whatsapp/session'), 50, 60000);

    const userId = apiKey.userId.toString();
    const userIdNum = apiKey.userId;

    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
      include: {
        Plan: {
          select: { name: true, sessionLimit: true },
        },
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const currentStatus = await redisGet(`user:${userId}:status`);
    if (currentStatus && currentStatus !== 'disconnected') {
      if (user.Plan.sessionLimit === 1) {
        throw new ConflictException(
          `Limite de sessões atingido. Seu plano "${user.Plan.name}" permite apenas ${user.Plan.sessionLimit} sessão ativa. Status atual: ${currentStatus}`,
        );
      }
    }

    const apiKeyHash = headers['x-api-key'] as string;
    if (apiKeyHash) {
      await redisSet(`user:${userId}:apikey`, apiKeyHash);
    }

    // Add to stream (replaces BullMQ queue.add)
    await addJob('streams:create-user', {
      idUser: userId,
      apiKeyHash,
    });

    return {
      success: true,
      sessionId: `session_${userId}`,
      status: 'initializing',
      message: 'Sessão criada. Use /qrcode para obter o QR Code',
    };
  })
  // ─── Delete Session (Logout) ───────────────────────────────────
  .delete('/session', async ({ apiKey, request }) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await checkRateLimit(
      rateLimitKey(ip, '/whatsapp/session/delete'),
      50,
      60000,
    );

    const userId = apiKey.userId.toString();

    const status = await redisGet(`user:${userId}:status`);
    if (!status && !(await redisGet(`user:${userId}:qrcode`))) {
      return { success: true, message: 'Already disconnected' };
    }

    await redisDel(`user:${userId}:status`);
    await redisDel(`user:${userId}:qrcode`);
    await redisDel(`user:${userId}:apikey`);

    return { success: true, message: 'Logout completed' };
  })
  // ─── Get Status ────────────────────────────────────────────────
  .get('/status', async ({ apiKey, request }) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await checkRateLimit(rateLimitKey(ip, '/whatsapp/status'), 1000, 60000);

    const userId = apiKey.userId.toString();
    const status =
      (await redisGet(`user:${userId}:status`)) || 'disconnected';

    return { status };
  });
