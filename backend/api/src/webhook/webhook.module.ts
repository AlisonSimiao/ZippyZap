import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueBoardModule } from '../queue-board/queue-board.module';
import { WebhookProcessor } from './webhook.processor';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [QueueBoardModule],
  providers: [RedisService, WebhookProcessor],
  exports: [WebhookProcessor],
})
export class WebhookModule {}
