import { Module } from '@nestjs/common';
import { UserCreate } from './user-create/user-create.processor';
import { SendMessage } from './send-message/send-message.processor';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-user',
    }),
    BullModule.registerQueue({
      name: 'send-message',
    }),
  ],
  controllers: [],
  providers: [RedisService, WhatsappService, UserCreate, SendMessage],
})
export class QueueModule { }
