import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'create-user',
    }),
  ],
  controllers: [AuthController],
  providers: [UserService, RedisService],
})
export class AuthModule {}
