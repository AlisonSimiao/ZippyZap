import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { SubscriptionController } from './subscription.controller';
import { PaymentService } from './payment.service';
import MercadoPagoConfig from 'mercadopago';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [PaymentController, SubscriptionController],
  providers: [
    PaymentService,
    {
      provide: 'MercadoPago',
      useValue: new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN ?? '',
      }),
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
