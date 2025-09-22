import { Module } from '@nestjs/common';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [ApiKeyController],
  providers: [ApiKeyService, RedisService],
})
export class ApiKeyModule {}
