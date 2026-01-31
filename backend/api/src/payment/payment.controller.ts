import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Request,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create')
  async createPayment(
    @Request() req: { user: { id: number } },
    @Body() body: { planId: number },
  ) {
    const userId = req.user.id;
    return this.paymentService.createPaymentPreference(userId, body.planId);
  }

  @Post('webhook')
  async webhook(@Body() data: any, @Headers() headers: Record<string, string>) {
    const signature = headers['x-signature'];
    const requestId = headers['x-request-id'];

    if (!signature || !requestId) {
      throw new UnauthorizedException('Assinatura inválida');
    }

    const isValid = this.paymentService.validateWebhookSignature(
      data,
      signature,
      requestId,
    );

    if (!isValid) {
      throw new UnauthorizedException('Assinatura inválida');
    }

    return this.paymentService.handleWebhook(data);
  }

  @Get('status/:paymentId')
  async getPaymentStatus(
    @Request() req: { user: { id: number } },
    @Param('paymentId') paymentId: string,
  ) {
    const userId = req.user.id;
    return this.paymentService.getPaymentStatus(parseInt(paymentId), userId);
  }
}
