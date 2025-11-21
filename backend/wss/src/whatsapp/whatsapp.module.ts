import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-user',
    }),
  ],
  controllers: [],
  providers: [RedisService, WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
