import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EProcessor } from '../queue-board/queue-board.module';
import { Processor } from '@nestjs/bullmq';
import { RedisService } from 'src/redis/redis.service';
import axios, { AxiosInstance } from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import crypto from 'crypto';
import { subHours, format } from 'date-fns';

interface IWebhookJob {
    idUser: string;
    type: string;
    data: any;
}

@Processor(EProcessor.WEBHOOK)
export class WebhookProcessor extends WorkerHost {
    private readonly logger = new Logger(WebhookProcessor.name);
    private readonly http: AxiosInstance;
    private readonly FOUR_HOURS = 60 * 60 * 4;

    constructor(private redis: RedisService, private prisma: PrismaService) {
        super();

        this.http = axios.create({
            timeout: 5000,
        });
    }


    async process(job: Job<IWebhookJob>): Promise<any> {
        this.logger.log(`Processing job ${job.id} - ${job.data.idUser}`);

        let webhook = await this.redis.get(`webhook:${job.data.idUser}`);
        let dataWebhook: { url: string; apiKey: string };

        if (!webhook) {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: +job.data.idUser,
                },
                select: {
                    webhookUrl: true,
                    ApiKeys: {
                        select: {
                            hash: true,
                            status: true,
                        },
                    },
                },
            })

            if (!user) {
                this.logger.log(`User ${job.data.idUser} not found`);
                throw new Error('User not found');
            }

            if (!user.webhookUrl) {
                this.logger.log(`User ${job.data.idUser} webhookUrl not found`);
                throw new Error('Webhook url not found');
            }

            if (!user.ApiKeys || user.ApiKeys.length === 0) {
                this.logger.log(`User ${job.data.idUser} has no API Keys for signing`);
                throw new Error('User has no API Keys for signing');
            }

            dataWebhook = { url: user.webhookUrl, apiKey: user.ApiKeys[0].hash };
        }
        else {
            dataWebhook = JSON.parse(webhook) as { url: string; apiKey: string };
        }

        const payload = {
            event: job.data.type,
            data: job.data.data,
            timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'-03:00'"),
        };

        const signature = this.generateSignature(payload, dataWebhook.apiKey);

        await this.http.post(
            dataWebhook.url,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                },
            },
        );

        await this.redis.setWithExpiration(`webhook:${job.data.idUser}`, JSON.stringify(dataWebhook), this.FOUR_HOURS);
    }

    generateSignature(payload: any, secret: string) {
        // Se o payload já for string, usa direto, senão converte
        const dataString = typeof payload === 'string' ? payload : JSON.stringify(payload);
        return crypto.createHmac('sha256', secret).update(dataString).digest('hex');
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`Job completed: ${job.id} - ${job.data.idUser}`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, err: Error) {
        this.logger.error(`Job failed: ${job.id} - ${job.data.idUser} - ${err.message}`);
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        this.logger.log(`Job started: ${job.id} - ${job.data.idUser}`);
    }
}
