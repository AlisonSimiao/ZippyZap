import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WuzapiClientService } from 'src/whatsapp/wuzapi-client.service';
import { RedisService } from 'src/redis/redis.service';
import { EProcessor } from '../types';

interface IJobData {
  idUser: string;
  telefone: string;
  text: string;
  apiKeyHash?: string;
}

@Processor(EProcessor.SEND_MESSAGE)
export class SendMessage extends WorkerHost {
  constructor(
    private readonly wuzapiClient: WuzapiClientService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  private readonly logger = new Logger(SendMessage.name);

  async process(job: Job<IJobData>): Promise<any> {
    this.logger.log(`Processing job: ${job.id}`, job.data);

    const { idUser, telefone, text, apiKeyHash } = job.data;

    try {
      // Get API key hash from Redis if not provided
      let userApiKeyHash = apiKeyHash;
      if (!userApiKeyHash) {
        const apiKeyFromRedis = await this.redisService.get(`user:${idUser}:apikey`);
        if (!apiKeyFromRedis) {
          throw new Error('API key not found for user');
        }
        userApiKeyHash = apiKeyFromRedis;
      }

      await this.wuzapiClient.sendMessage(idUser, userApiKeyHash, telefone, text);
      this.logger.log(`Message sent successfully: ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to send message: ${job.id}`, error.message);
      throw error;
    }

    return;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job completed: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job failed: ${job.id} - ${err.message}`, err.stack);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job started: ${job.id}`);
  }
}
