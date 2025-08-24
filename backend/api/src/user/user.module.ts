import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-user',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
})
export class UserModule {}
