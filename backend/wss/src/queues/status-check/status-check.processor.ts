import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WuzapiClientService } from '../../whatsapp/wuzapi-client.service';
import { RedisService } from '../../redis/redis.service';

@Processor('status-check')
export class StatusCheckProcessor extends WorkerHost {
  private readonly logger = new Logger(StatusCheckProcessor.name);

  constructor(
    private readonly wuzapiClient: WuzapiClientService,
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing status check job ${job.id}`);

    try {
      const users = await this.wuzapiClient.getUsers();
      this.logger.log(`Found ${users.length} users to check status`);

      for (const user of users) {
        // user.name is the userId in Zapi
        // user.token is the apiKeyHash
        try {
          // Update Redis
          // Key format: user:${userId}:status
          if (user.connected && user.loggedIn) {
            await this.redisService.set(
              `user:${user.name}:status`,
              'connected',
            );
          } else {
            // If disconnected, we delete the key to match webhook behavior
            await this.redisService.set(
              `user:${user.name}:status`,
              'disconnected',
            );
          }

          // Send to Webhook if configured
          if (user.webhook) {
            try {
              // Construct payload compatible with WuzAPI webhook structure
              // The API expects: { instanceName: string, jsonData: string, userID: string }
              const webhookPayload = {
                instanceName: user.name,
                userID: user.name,
                type: 'status',
                event: {
                  status:
                    user.connected && user.loggedIn
                      ? 'connected'
                      : 'disconnected',
                  timestamp: Date.now(),
                },
              };

              await firstValueFrom(
                this.httpService.post(user.webhook, webhookPayload, {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token,
                  },
                }),
              );
              this.logger.log(`Webhook sent for user ${user.name}`);
            } catch (webhookError) {
              this.logger.error(
                `Failed to send webhook for user ${user.name}`,
                (webhookError?.message as string) || '',
              );
            }
          }
        } catch (err) {
          this.logger.error(
            `Failed to check status for user ${user.name}`,
            err,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to check statuses', error);
      throw error;
    }
  }
}
