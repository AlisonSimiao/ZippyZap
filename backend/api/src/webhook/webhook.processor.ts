import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Job } from 'bullmq';
import crypto from 'crypto';
import { format } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { EProcessor } from '../queue-board/queue-board.module';

interface IWebhookJob {
  idUser: string;
  type: string;
  data: any;
}

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
    this.logger.log(`Processing job ${job.id} - ${job.data.idUser}`);

    const cacheKey = `webhook:${job.data.idUser}:${job.data.type}`;
    const cachedData = await this.redis.get(cacheKey);
    let webhookData: IWebhookData;

    if (!cachedData) {
      // Buscar apenas o webhook mais novo ativo com o evento habilitado
      const webhook = await this.prisma.webhook.findFirst({
        where: {
          userId: +job.data.idUser,
          isActive: true,
          webhookEvents: {
            some: {
              active: true,
              event: {
                slug: job.data.type,
              },
            },
          },
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
        this.logger.log(
          `No active webhook found for user ${job.data.idUser} with event ${job.data.type}`
        );
        return;
      }

      if (!webhook.user.ApiKeys || webhook.user.ApiKeys.length === 0) {
        this.logger.log(
          `User ${job.data.idUser} has no active API Keys for signing`
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
        300
      );
    } else {
      webhookData = JSON.parse(cachedData) as IWebhookData;
    }

    const payload = {
      event: job.data.type,
      data: job.data.data,
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'-03:00'"),
      webhookId: webhookData.id,
    };

    const signature = this.generateSignature(payload, webhookData.apiKey);

    try {
      await this.http.post(webhookData.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
      });

      this.logger.log(
        `Webhook ${webhookData.id} sent successfully for event ${job.data.type}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send webhook ${webhookData.id}: ${error.message}`
      );
      throw error;
    }
  }

  generateSignature(payload: any, secret: string) {
    // Se o payload já for string, usa direto, senão converte
    const dataString =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(dataString).digest('hex');
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job completed: ${job.id} - ${job.data.idUser}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job failed: ${job.id} - ${job.data.idUser} - ${err.message}`,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job started: ${job.id} - ${job.data.idUser}`);
  }
}
