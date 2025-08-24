import { Module } from '@nestjs/common';
import { UserCreate } from './user-create/user-create.processor';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-user',
    }),
  ],
  controllers: [],
  providers: [RedisService, WhatsappService, UserCreate],
})
export class QueueModule {}
