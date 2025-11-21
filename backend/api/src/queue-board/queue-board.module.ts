import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        BullBoardModule.forRoot({
            route: '/admin/queues',
            adapter: ExpressAdapter,
        }),
        BullBoardModule.forFeature({
            name: 'send-message',
            adapter: BullMQAdapter,
        }),
        BullBoardModule.forFeature({
            name: 'create-user',
            adapter: BullMQAdapter,
        }),
        BullModule.registerQueue({
            name: 'send-message',
        }),
        BullModule.registerQueue({
            name: 'create-user',
        }),
    ],
})
export class QueueBoardModule { }
