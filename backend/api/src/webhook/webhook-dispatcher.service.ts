import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EProcessor } from '../queue-board/queue-board.module';

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(@InjectQueue(EProcessor.WEBHOOK) private webhookQueue: Queue) {}

  async dispatch(userId: number, eventType: string, data: any) {
    try {
      await this.webhookQueue.add(
        'webhook-event',
        {
          idUser: userId.toString(),
          type: eventType,
          data,
        },
        {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      this.logger.log(
        `Webhook dispatched for user ${userId}, event: ${eventType}`,
      );
    } catch (error) {
      this.logger.error(`Failed to dispatch webhook: ${error.message}`);
    }
  }

  // Métodos específicos para cada tipo de evento
  async messageReceived(userId: number, message: any) {
    await this.dispatch(userId, 'message.received', message);
  }

  async messageSent(userId: number, message: any) {
    await this.dispatch(userId, 'message.sent', message);
  }

  async messageDelivered(userId: number, message: any) {
    await this.dispatch(userId, 'message.delivered', message);
  }

  async messageRead(userId: number, message: any) {
    await this.dispatch(userId, 'message.read', message);
  }

  async connectionStatus(userId: number, status: any) {
    await this.dispatch(userId, 'connection.status', status);
  }
}
