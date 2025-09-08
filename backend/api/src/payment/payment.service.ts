import { Inject, Injectable } from '@nestjs/common';
import MercadoPagoConfig, { Preference } from 'mercadopago';

@Injectable()
export class PaymentService {
  constructor(@Inject('MercadoPago') private readonly mp: MercadoPagoConfig) {}

  async createPreferences() {
    const preference = new Preference(this.mp);

    const result = await preference
      .create({
        body: {
          items: [
            {
              id: '1',
              title: 'PLANO 2',
              quantity: 1,
              unit_price: 100,
            },
          ],
          back_urls: {
            success: 'https://0d6960d3e826.ngrok-free.app/payments/hook',
            failure: 'https://0d6960d3e826.ngrok-free.app/payments/hook',
            pending: 'https://0d6960d3e826.ngrok-free.app/payments/hook',
          },
          auto_return: 'approved',
          payer: {
            email: 'test_user_12345678@testuser.com',
          },
          notification_url: 'https://0d6960d3e826.ngrok-free.app/payments/hook',
        },
      })
      .catch((err) => console.log(err));

    return result;
  }

  hook(data: any) {
    console.log(data);
  }
}
