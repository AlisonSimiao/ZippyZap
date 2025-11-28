import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ApiKeyMiddleware } from '../api-key/api-key.middleware';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisService } from '../redis/redis.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'send-message',
    }),
    BullModule.registerQueue({
      name: 'create-user',
    }),
    PrismaModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, RedisService, UserService],
})
export class WhatsappModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes(WhatsappController);
  }
}
