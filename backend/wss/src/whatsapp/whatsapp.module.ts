import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { WuzapiClientService } from './wuzapi-client.service';
@Module({
  imports: [HttpModule, RedisModule],
  providers: [WuzapiClientService],
  controllers: [],
  exports: [WuzapiClientService],
})
export class WhatsappModule {}
