import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  createPayment() {
    return this.paymentService.createPreferences();
  }

  @Post('hook')
  hook(@Body() data: any) {
    return this.paymentService.hook(data);
  }
}
