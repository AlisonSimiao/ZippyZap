import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from 'src/redis/redis.service';
import { QueueBoardModule } from 'src/queue-board/queue-board.module';

@Module({
  imports: [
    QueueBoardModule,
    BullModule.registerQueue(
      { name: 'create-user' },
    ),
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
  exports: [UserService],
})
export class UserModule { }
