import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
export enum EProcessor {
    CREATE_USER = 'create-user',
    SEND_MESSAGE = 'send-message',
    WEBHOOK = 'webhook',
}

@Module({
    imports: [
        BullBoardModule.forRoot({
            route: '/admin/queues',
            adapter: ExpressAdapter,
        }),
        BullBoardModule.forFeature({
            name: EProcessor.CREATE_USER,
            adapter: BullMQAdapter,
        }),
        BullBoardModule.forFeature({
            name: EProcessor.SEND_MESSAGE,
            adapter: BullMQAdapter,
        }),
        BullBoardModule.forFeature({
            name: EProcessor.WEBHOOK,
            adapter: BullMQAdapter,
        }),
        BullModule.registerQueue({
            name: EProcessor.CREATE_USER,
        }),
        BullModule.registerQueue({
            name: EProcessor.SEND_MESSAGE,
        }),
        BullModule.registerQueue({
            name: EProcessor.WEBHOOK,
            defaultJobOptions: {
                attempts: 2,
                backoff: {
                    type: 'fixed',
                    delay: 5000,
                },
            },
        }),
    ],
})
export class QueueBoardModule { }
