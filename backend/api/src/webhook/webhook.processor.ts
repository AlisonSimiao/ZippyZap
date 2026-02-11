import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Job } from 'bullmq';
import crypto, { createHmac } from 'crypto';
import { format } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { EProcessor } from '../queue-board/queue-board.module';
import { IWebhookJob } from './webhook-job.types';

interface IWebhookData {
  id: number;
  url: string;
  apiKey: string;
}

@Processor(EProcessor.WEBHOOK)
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);
  private readonly http: AxiosInstance;
  private readonly FOUR_HOURS = 60 * 60 * 4;

  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {
    super();

    this.http = axios.create({
      timeout: 5000,
    });
  }

  async process(job: Job<IWebhookJob>): Promise<any> {
    this.logger.log(`Processing job ${job.id} -`, job.data);

    // ====== Special handling for internal events (QR, status) ======
    // These events need to be stored in Redis for system state management
    // They should NOT be forwarded to user webhooks

    if (job.data.type === 'QR') {
      // Store QR code in Redis
      const ttlSeconds = Math.max(
        Math.floor((job.data.data.expireAt - Date.now()) / 1000),
        60, // Minimum 60 seconds
      );

      await this.redis.setWithExpiration(
        `user:${job.data.idUser}:qrcode`,
        JSON.stringify(job.data.data),
        ttlSeconds,
      );

      this.logger.log(
        `QR code saved to Redis for user ${job.data.idUser} (TTL: ${ttlSeconds}s)`,
      );
      return; // Don't send to user webhooks
    }

    if (job.data.type === 'session.connected') {
      // Store connected status and clear QR code
      await this.redis.set(`user:${job.data.idUser}:status`, 'connected');
      await this.redis.delete(`user:${job.data.idUser}:qrcode`);

      this.logger.log(`User ${job.data.idUser} status updated to: connected`);
      return; // Don't send to user webhooks
    }

    if (job.data.type === 'session.disconnected') {
      // Store disconnected status
      await this.redis.set(`user:${job.data.idUser}:status`, 'disconnected');

      this.logger.log(`User ${job.data.idUser} status updated to: disconnected`);
      return; // Don't send to user webhooks
    }

    // ====== Normal webhook forwarding for user events ======

    const cacheKey = `webhook:${job.data.idUser}:${job.data.type}`;
    const cachedData = await this.redis.get(cacheKey);
    let webhookData: IWebhookData;

    if (!cachedData) {
      // Buscar apenas o webhook mais novo ativo com o evento habilitado
      const webhook = await this.prisma.webhook.findFirst({
        where: {
          userId: +job.data.idUser,
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
      console.log({ webhook, jobData: job.data });
      if (!webhook) {
        this.logger.log(
          `No active webhook found for user ${job.data.idUser} with event ${job.data.type}`,
        );
        return;
      }

      if (!webhook.user.ApiKeys || webhook.user.ApiKeys.length === 0) {
        this.logger.log(
          `User ${job.data.idUser} has no active API Keys for signing`,
        );
        return;
      }

      webhookData = {
        id: webhook.id,
        url: webhook.url,
        apiKey: webhook.user.ApiKeys[0].hash,
      };

      // Cache por 5 minutos
      await this.redis.setWithExpiration(
        cacheKey,
        JSON.stringify(webhookData),
        300,
      );
    } else {
      webhookData = JSON.parse(cachedData) as IWebhookData;
    }
    console.log({ webhookData });
    const payload = {
      event: job.data.type,
      data: job.data.data,
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'-03:00'"),
      webhookId: webhookData.id,
    };

    const signature = this.generateSignature(payload, webhookData.apiKey);

    const start = Date.now();
    let status = 0;
    let responseBody = '';
    let errorMsg: string = '';

    try {
      const response = await this.http.post(webhookData.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
      });

      status = response.status;
      responseBody = JSON.stringify(response.data ?? {}).substring(0, 1000);

      this.logger.log(
        `Webhook ${webhookData.id} sent successfully for event ${job.data.type}`,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<Record<string, unknown>>;
        if (axiosError.response) {
          status = axiosError.response.status;
          responseBody = JSON.stringify(
            axiosError.response.data ?? {},
          ).substring(0, 1000);
        }
      } else {
        status = 500;
      }
      errorMsg = err.message;
      responseBody = err.message;
      this.logger.error(
        `Failed to send webhook ${webhookData.id}: ${err.message}`,
      );
    } finally {
      const duration = Date.now() - start;

      await this.prisma.webhookLog.create({
        data: {
          webhookId: webhookData.id,
          event: job.data.type,
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

  generateSignature(payload: unknown, secret: string) {
    // Se o payload já for string, usa direto, senão converte
    const dataString =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    return createHmac('sha256', secret).update(dataString).digest('hex');
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<IWebhookJob>) {
    this.logger.log(`Job completed: ${job.id} - ${job.data.idUser}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<IWebhookJob>, err: Error) {
    this.logger.error(
      `Job failed: ${job.id} - ${job.data.idUser} - ${err.message}`,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<IWebhookJob>) {
    this.logger.log(`Job started: ${job.id} - ${job.data.idUser}`);
  }
}
