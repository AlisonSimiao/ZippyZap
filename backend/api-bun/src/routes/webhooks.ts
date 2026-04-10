import { Elysia, t } from 'elysia';
import { prisma } from '../services/prisma';
import { redisDel, redisGet, redisKeys } from '../services/redis';
import { addJob } from '../streams/producer';
import {
  ForbiddenException,
  UnauthorizedException,
  type IWebhookJob,
  type QRWebhookJob,
  type WuzapiWebhookPayload,
} from '../types';
import { PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

export const webhookRoutes = new Elysia({ prefix: '/webhooks' })
  // ─── Create Webhook ────────────────────────────────────────────
  .post(
    '/',
    async (ctx: any) => {
      const user = ctx.user;
      const body = ctx.body;
      if (!user) throw new ForbiddenException('Not authenticated');

      const events = await prisma.event.findMany();
      const selectedEvents = body.events || [];

      // Check if webhook already exists
      const existingWebhook = await prisma.webhook.findFirst({
        where: { userId: user.id },
      });

      if (existingWebhook) {
        return updateWebhook(existingWebhook.id, user.id, body);
      }

      return prisma.webhook.create({
        data: {
          url: body.url,
          name: body.name,
          isActive: body.isActive ?? true,
          userId: user.id,
          webhookEvents: {
            create: events.map((event) => ({
              event: { connect: { id: event.id } },
              active: selectedEvents.includes(event.slug),
            })),
          },
        },
        include: {
          webhookEvents: { include: { event: true } },
        },
      });
    },
    {
      body: t.Object({
        url: t.String(),
        name: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
        events: t.Optional(t.Array(t.String())),
      }),
    },
  )
  // ─── List Events ───────────────────────────────────────────────
  .get('/events', async () => {
    return prisma.event.findMany();
  })
  // ─── Get User Webhook ──────────────────────────────────────────
  .get('/', async (ctx: any) => {
    const user = ctx.user;
    if (!user) throw new ForbiddenException('Not authenticated');

    return prisma.webhook.findFirst({
      where: { userId: user.id },
      include: {
        webhookEvents: { include: { event: true } },
      },
    });
  })
  // ─── Update Webhook ────────────────────────────────────────────
  .patch(
    '/:id',
    async (ctx: any) => {
      const user = ctx.user;
      const params = ctx.params;
      const body = ctx.body;
      if (!user) throw new ForbiddenException('Not authenticated');
      return updateWebhook(Number(params.id), user.id, body);
    },
    {
      body: t.Object({
        url: t.Optional(t.String()),
        name: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
        events: t.Optional(t.Array(t.String())),
      }),
    },
  )
  // ─── Delete Webhook ────────────────────────────────────────────
  .delete('/:id', async (ctx: any) => {
    const user = ctx.user;
    const params = ctx.params;
    if (!user) throw new ForbiddenException('Not authenticated');

    const result = await prisma.webhook.delete({
      where: { id: Number(params.id) },
    });

    await clearWebhookCache(user.id);
    return result;
  })
  // ─── WuzAPI Webhook (Public) ───────────────────────────────────
  .post('/wuzapi', async ({ body, set }) => {
    // Respond immediately (same as NestJS version)
    set.status = 200;

    try {
      const payload = body as WuzapiWebhookPayload;
      const userId = payload.instanceName;
      let jobData: IWebhookJob | QRWebhookJob | null = null;

      console.log(
        `[WuzAPI] Received webhook: ${payload.type} for session ${payload.userID}`,
      );

      switch (payload.type) {
        case 'QR':
          jobData = handleQR(payload);
          break;

        case 'status':
          jobData = handleStatus(payload);
          break;

        case 'Message':
        case 'message':
          jobData = handleMessage(payload);
          break;

        case 'Receipt':
          jobData = handleMessageRead(payload);
          break;

        case 'ReadReceipt':
        case 'Presence':
        case 'ChatPresence':
        case 'HistorySync':
        case 'Group':
        case 'UndecryptableMessage':
        case 'MediaRetry':
          console.log(
            `[WuzAPI] ${payload.type} event for user ${userId} (not forwarded)`,
          );
          break;

        default:
          console.log(`[WuzAPI] Unhandled event: ${payload.type}`);
      }

      if (jobData) {
        await addJob('streams:webhook', jobData);
      }

      return { success: true };
    } catch (error) {
      console.error('[WuzAPI] Error processing webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

// ─── Helpers ───────────────────────────────────────────────────────

async function updateWebhook(
  id: number,
  userId: number,
  body: { url?: string; name?: string; isActive?: boolean; events?: string[] },
) {
  const updateData: any = {
    url: body.url,
    name: body.name,
    isActive: body.isActive,
  };

  if (body.events) {
    await prisma.webhookEvent.updateMany({
      where: { webhookId: id },
      data: { active: false },
    });

    const events = await prisma.event.findMany({
      where: { slug: { in: body.events } },
    });

    for (const event of events) {
      await prisma.webhookEvent.update({
        where: {
          webhookId_eventId: { webhookId: id, eventId: event.id },
        },
        data: { active: true },
      });
    }
  }

  const result = await prisma.webhook.update({
    where: { id },
    data: updateData,
    include: {
      webhookEvents: { include: { event: true } },
    },
  });

  await clearWebhookCache(userId);
  return result;
}

async function clearWebhookCache(userId: number) {
  const pattern = `webhook:${userId}:*`;
  const keys = await redisKeys(pattern);
  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redisDel(key)));
  }
}

// ─── WuzAPI Event Handlers ─────────────────────────────────────────

function handleQR(payload: WuzapiWebhookPayload): QRWebhookJob | null {
  const idUser = payload.instanceName;

  if ((payload as any)['qrCodeBase64']) {
    return {
      idUser,
      type: 'QR',
      data: {
        qr: (payload as any)['qrCodeBase64'] as string,
        expireAt: Date.now() + 60000,
      },
    };
  }
  return null;
}

function handleStatus(payload: WuzapiWebhookPayload): IWebhookJob {
  return {
    idUser: payload.instanceName,
    type: `session.${payload.event.status}`,
    data: payload.event,
  };
}

function handleMessage(payload: WuzapiWebhookPayload): IWebhookJob | null {
  const messageData = payload.event;
  const ignore = !!messageData.Message?.senderKeyDistributionMessage;
  if (ignore) return null;

  let media: any;
  let reaction: any;

  if (messageData.Message?.imageMessage) {
    media = {
      thumbnail: messageData.Message.imageMessage.JPEGThumbnail || '',
      width: messageData.Message.imageMessage.width || 0,
      height: messageData.Message.imageMessage.height || 0,
      mimeType: messageData.Message.imageMessage.mimetype || '',
      size: messageData.Message.imageMessage.fileLength || 0,
    };
  }

  if (messageData.Message?.ptvMessage) {
    media = {
      thumbnail: messageData.Message.ptvMessage.JPEGThumbnail || '',
      width: messageData.Message.ptvMessage.width || 0,
      height: messageData.Message.ptvMessage.height || 0,
      mimeType: messageData.Message.ptvMessage.mimetype || '',
      size: messageData.Message.ptvMessage.fileLength || 0,
    };
  }

  if (messageData.Message?.reactionMessage) {
    reaction = {
      emoji: messageData.Message.reactionMessage.text,
      participant:
        messageData.Message.reactionMessage.key?.participant?.split('@')[0] ||
        '',
      idMessage: messageData.Message.reactionMessage.key?.ID || '',
    };
  }

  return {
    idUser: payload.instanceName,
    type: 'message.received',
    data: {
      chatId: messageData.Info.Chat,
      sender: messageData.Info.SenderAlt?.split('@')[0],
      timestamp: messageData.Info.Timestamp,
      type: messageData.Info.Type,
      text:
        messageData.Message?.conversation ??
        messageData.Message?.extendedTextMessage?.text ??
        null,
      reply:
        messageData.Message?.messageContextInfo?.quotedMessage?.conversation ??
        messageData.Message?.messageContextInfo?.quotedMessage
          ?.extendedTextMessage?.text ??
        null,
      senderName: messageData.Info.PushName,
      media,
      reaction,
      idMessage: messageData.Info.ID,
      isFromMe: messageData.Info.IsFromMe,
      isGroup: messageData.Info.IsGroup,
      isEdit: messageData.Info.Edit,
    },
  };
}

function handleMessageRead(payload: WuzapiWebhookPayload): IWebhookJob {
  return {
    data: {
      messageIds: payload.event.MessageIDs,
      chatId: payload.event.Chat,
      sender: payload.event.Sender?.split('@')[0],
      timestamp: payload.event.Timestamp,
    },
    idUser: payload.instanceName,
    type: 'message.read',
  };
}
