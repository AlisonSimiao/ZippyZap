import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [],
  controllers: [],
  providers: [WhatsappService, RedisService],
  exports: [WhatsappService],
})
export class WhatsappModule { }
