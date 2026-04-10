import {
  redisGet,
  redisSet,
  redisSetWithExpiry,
  redisDel,
} from '../../services/redis';
import { prisma } from '../../services/prisma';
import { createHmac } from 'crypto';
import { format } from 'date-fns';

interface WebhookData {
  id: number;
  url: string;
  apiKey: string;
}

/**
 * Webhook handler — replaces NestJS WebhookProcessor
 *
 * Processes webhook events:
 * - Internal events (QR, session status) → update Redis
 * - User events (messages, receipts) → forward to user webhook URL
 */
export async function handleWebhook(
  data: Record<string, any>,
): Promise<void> {
  const { idUser, type, data: eventData } = data;

  // ─── Internal events (not forwarded) ─────────────────────────
  if (type === 'QR') {
    const ttlSeconds = Math.max(
      Math.floor((eventData.expireAt - Date.now()) / 1000),
      60,
    );
    await redisSetWithExpiry(
      `user:${idUser}:qrcode`,
      JSON.stringify(eventData),
      ttlSeconds,
    );
    console.log(
      `[Webhook] QR code saved for user ${idUser} (TTL: ${ttlSeconds}s)`,
    );
    return;
  }

  if (type === 'session.connected') {
    await redisSet(`user:${idUser}:status`, 'connected');
    await redisDel(`user:${idUser}:qrcode`);
    console.log(`[Webhook] User ${idUser} status: connected`);
    return;
  }

  if (type === 'session.disconnected') {
    await redisSet(`user:${idUser}:status`, 'disconnected');
    console.log(`[Webhook] User ${idUser} status: disconnected`);
    return;
  }

  // ─── User events (forwarded to webhook URL) ──────────────────

  const cacheKey = `webhook:${idUser}:${type}`;
  const cachedData = await redisGet(cacheKey);
  let webhookData: WebhookData;

  if (!cachedData) {
    const webhook = await prisma.webhook.findFirst({
      where: {
        userId: +idUser,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            ApiKeys: {
              where: { status: 'ACTIVE' },
              select: { hash: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!webhook) {
      console.log(
        `[Webhook] No active webhook for user ${idUser} event ${type}`,
      );
      return;
    }

    if (!webhook.user.ApiKeys || webhook.user.ApiKeys.length === 0) {
      console.log(`[Webhook] User ${idUser} has no active API Keys for signing`);
      return;
    }

    webhookData = {
      id: webhook.id,
      url: webhook.url,
      apiKey: webhook.user.ApiKeys[0].hash,
    };

    // Cache for 5 minutes
    await redisSetWithExpiry(cacheKey, JSON.stringify(webhookData), 300);
  } else {
    webhookData = JSON.parse(cachedData) as WebhookData;
  }

  const payload = {
    event: type,
    data: eventData,
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'-03:00'"),
    webhookId: webhookData.id,
  };

  const signature = generateSignature(payload, webhookData.apiKey);

  const start = Date.now();
  let status = 0;
  let responseBody = '';
  let errorMsg = '';

  try {
    const response = await fetch(webhookData.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    status = response.status;
    const text = await response.text();
    responseBody = text.substring(0, 1000);

    console.log(
      `[Webhook] ${webhookData.id} sent for event ${type} → ${status}`,
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    status = 500;
    errorMsg = err.message;
    responseBody = err.message;
    console.error(`[Webhook] Failed ${webhookData.id}: ${err.message}`);
  } finally {
    const duration = Date.now() - start;
    await prisma.webhookLog.create({
      data: {
        webhookId: webhookData.id,
        event: type,
        payload: payload,
        status,
        response: responseBody,
        duration,
      },
    });
  }

  if (errorMsg) {
    throw new Error(errorMsg);
  }
}

function generateSignature(payload: unknown, secret: string): string {
  const dataString =
    typeof payload === 'string' ? payload : JSON.stringify(payload);
  return createHmac('sha256', secret).update(dataString).digest('hex');
}
