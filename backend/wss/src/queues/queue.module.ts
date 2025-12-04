import { Module } from '@nestjs/common';
import { UserCreate } from './user-create/user-create.processor';
import { SendMessage } from './send-message/send-message.processor';
import { SessionLogout } from './session-logout/session-logout.processor';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from 'src/redis/redis.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    RedisModule,
    WhatsappModule,
    BullModule.registerQueue(
      { name: 'create-user' },
      {
        name: 'send-message',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
      { name: 'session-logout' },
    ),
  ],
  controllers: [],
  providers: [ConfigService, UserCreate, SendMessage, SessionLogout],
})
export class QueueModule { }
