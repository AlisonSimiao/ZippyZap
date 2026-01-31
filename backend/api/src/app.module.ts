import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { PlanModule } from './plan/plan.module';
import { BullModule } from '@nestjs/bullmq';
import { PaymentModule } from './payment/payment.module';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookModule } from './webhook/webhook.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ApiKeyModule } from './api-key/api-key.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { QueueBoardModule } from './queue-board/queue-board.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './auth/guards/throttle.guard';
import { getThrottleConfig } from './config/throttle.config';
import { ApiKeyMiddleware } from './api-key/api-key.middleware';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ThrottlerModule.forRoot(getThrottleConfig()),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASS,
      },
    }),
    AuthModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRE
          ? Number(process.env.JWT_EXPIRE)
          : undefined,
      },
    }),
    PlanModule,
    PaymentModule,
    WebhookModule,
    ApiKeyModule,
    WhatsappModule,
    QueueBoardModule,
    DashboardModule,
  ],
  controllers: [AppController, WebhookController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/', method: RequestMethod.GET },
        { path: '/auth/*path', method: RequestMethod.POST },
        { path: '/plans', method: RequestMethod.GET },
        { path: '/health', method: RequestMethod.GET },
        { path: '/webhooks/(.*)', method: RequestMethod.ALL },
        { path: '/whatsapp', method: RequestMethod.ALL },
        { path: '/whatsapp/*path', method: RequestMethod.ALL },
        { path: '/payments/webhook', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(ApiKeyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
