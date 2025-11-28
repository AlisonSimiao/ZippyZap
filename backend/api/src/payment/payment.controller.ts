import { Body, Controller, Post, Get, Param, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create')
  async createPayment(@Request() req, @Body() body: { planId: number }) {
    const userId = req.user.id;
    return this.paymentService.createPaymentPreference(userId, body.planId);
  }

  @Post('webhook')
  async webhook(@Body() data: any) {
    return this.paymentService.handleWebhook(data);
  }

  @Get('status/:paymentId')
  async getPaymentStatus(
    @Request() req,
    @Param('paymentId') paymentId: string,
  ) {
    const userId = req.user.id;
    return this.paymentService.getPaymentStatus(parseInt(paymentId), userId);
  }
}
