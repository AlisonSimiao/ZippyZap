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

@Processor(EProcessor.SESSION_LOGOUT)
export class SessionLogout extends WorkerHost {
    constructor(
        private readonly wuzapiClient: WuzapiClientService,
        private readonly redisService: RedisService,
    ) {
        super();
    }

    private readonly logger = new Logger(EProcessor.SESSION_LOGOUT);

    async process(job: Job<IJobData>): Promise<any> {
        this.logger.log(`Processing logout job: ${job.id}`, job.data);

        const { idUser, apiKeyHash } = job.data;

        try {
            // Get API key hash from Redis if not provided
            let userApiKeyHash = apiKeyHash;
            if (!userApiKeyHash) {
                const apiKeyFromRedis = await this.redisService.get(`user:${idUser}:apikey`);
                if (!apiKeyFromRedis) {
                    this.logger.warn(`API key not found for user ${idUser}, cannot logout from WuzAPI`);
                    // Even if API key is missing, we should clean up local state
                    await this.cleanupLocalState(idUser);
                    return;
                }
                userApiKeyHash = apiKeyFromRedis;
            }

            // Logout from WuzAPI
            await this.wuzapiClient.logout(idUser, userApiKeyHash);

            // Cleanup local state
            await this.cleanupLocalState(idUser);

            this.logger.log(`Session logout completed for user ${idUser}`);
        } catch (error) {
            this.logger.error(`Failed to logout session for ${idUser}:`, error.message);
            // Even on error, try to cleanup local state
            await this.cleanupLocalState(idUser);
            throw error;
        }

        return;
    }

    private async cleanupLocalState(userId: string) {
        await this.redisService.del(`user:${userId}:status`);
        await this.redisService.del(`user:${userId}:qrcode`);
        // We don't delete the API key because the user might want to reconnect later
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
