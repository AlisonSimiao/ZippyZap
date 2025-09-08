import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import MercadoPagoConfig from 'mercadopago';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'MercadoPago',
      useValue: new MercadoPagoConfig({
        accessToken:
          'APP_USR-8866934838584637-082923-e30d73fb35600b38d7a9bd60a3fb56bb-2654936647',
      }),
    },
  ],
})
export class PaymentModule {}
