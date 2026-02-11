import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WuzapiClientService } from 'src/whatsapp/wuzapi-client.service';
import { RedisService } from 'src/redis/redis.service';
import { EProcessor } from '../types';

interface IJobData {
  idUser: string;
  apiKeyHash?: string;
}

@Processor(EProcessor.CREATE_USER)
export class UserCreate extends WorkerHost {
  constructor(
    private readonly wuzapiClient: WuzapiClientService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  private readonly logger = new Logger(EProcessor.CREATE_USER);

  async process(job: Job<IJobData>): Promise<any> {
    this.logger.log(`Processing job: ${job.id}`, job.data);

    const { idUser, apiKeyHash } = job.data;

    try {
      // Get API key hash from Redis if not provided
      let userApiKeyHash = apiKeyHash;
      if (!userApiKeyHash) {
        const apiKeyFromRedis = await this.redisService.get(
          `user:${idUser}:apikey`,
        );
        if (!apiKeyFromRedis) {
          throw new Error('API key not found for user');
        }
        userApiKeyHash = apiKeyFromRedis;
      }

      // Create WuzAPI user if not exists
      await this.wuzapiClient.createWuzapiUser(idUser, userApiKeyHash);

      // Check if session is already connected
      this.logger.log(`Checking connection status for user ${idUser}...`);
      const status = await this.wuzapiClient.getConnectionStatus(
        idUser,
        userApiKeyHash,
      );

      if (status === 'connected') {
        this.logger.log(
          `User ${idUser} is already connected. Logging out to generate new QR code...`,
        );
        // Logout first to allow new QR code generation
        await this.wuzapiClient.logout(idUser, userApiKeyHash);

        // Wait a bit for logout to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Start WhatsApp session (will generate QR code)
      this.logger.log(`Starting session for user ${idUser}...`);
      await this.wuzapiClient.startSession(idUser, userApiKeyHash);

      this.logger.log(`Session creation initiated for user ${idUser}`);
    } catch (error) {
      this.logger.error(
        `Failed to create session for ${idUser}:`,
        error.message,
      );
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
    this.logger.error(`Job failed: ${job.id} - ${err.message}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job started: ${job.id}`);
  }
}
