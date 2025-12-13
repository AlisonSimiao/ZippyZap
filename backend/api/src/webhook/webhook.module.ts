import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import {
  QueueBoardModule,
  EProcessor,
} from '../queue-board/queue-board.module';
import { WebhookProcessor } from './webhook.processor';
import { RedisService } from 'src/redis/redis.service';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { PrismaModule } from 'src/prisma/prisma.module';

import { WuzapiWebhookController } from './wuzapi-webhook.controller';

@Module({
  imports: [
    QueueBoardModule,
    PrismaModule,
    BullModule.registerQueue({
      name: EProcessor.WEBHOOK,
    }),
  ],
  controllers: [WebhookController, WuzapiWebhookController],
  providers: [
    RedisService,
    WebhookProcessor,
    WebhookService,
    WebhookDispatcherService,
  ],
  exports: [WebhookProcessor, WebhookService, WebhookDispatcherService],
})
export class WebhookModule {}
