import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueBoardModule } from '../queue-board/queue-board.module';
import { WebhookService } from './webhook.processor';

@Module({
    imports: [
        QueueBoardModule,
    ],
    providers: [WebhookService],
    exports: [WebhookService],
})
export class WebhookModule { }
