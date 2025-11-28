import { Controller, Get, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private paymentService: PaymentService) {}

  @Get('current')
  async getCurrentSubscription(@Request() req) {
    const userId = req.user.id;
    return this.paymentService.getUserSubscription(userId);
  }
}
