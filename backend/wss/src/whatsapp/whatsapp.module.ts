import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-user',
    }),
  ],
  controllers: [WhatsappController],
  providers: [RedisService, WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
