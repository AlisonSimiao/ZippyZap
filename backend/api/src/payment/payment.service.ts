import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import MercadoPagoConfig, {
  Preference,
  Payment as MPPayment,
} from 'mercadopago';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('MercadoPago') private readonly mp: MercadoPagoConfig,
    private readonly prisma: PrismaService,
  ) {}

  async createPaymentPreference(userId: number, planId: number) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (!plan.isActive) {
      throw new BadRequestException('Plano não está ativo');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validar preço
    const price = parseFloat(plan.price.toString());
    if (isNaN(price) || price <= 0) {
      throw new BadRequestException('Preço do plano inválido');
    }

    // Validar URLs obrigatórias
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    if (!baseUrl || !backendUrl) {
      this.logger.error('FRONTEND_URL ou BACKEND_URL não configuradas');
      throw new BadRequestException('Configuração de URL incompleta');
    }

    const externalReference = `payment_${userId}_${planId}_${Date.now()}`;
    const preference = new Preference(this.mp);

    try {
      const preferenceData = {
        items: [
          {
            id: planId.toString(),
            title: `Plano ${plan.name}`,
            description: `${plan.dailyLimit} msg/dia, ${plan.monthlyLimit} msg/mês`,
            quantity: 1,
            unit_price: price,
            currency_id: 'BRL',
          },
        ],
        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/payment/failure`,
          pending: `${baseUrl}/payment/pending`,
        },
        payer: {
          email: user.email,
          name: user.name || undefined,
        },
        external_reference: externalReference,
        notification_url: `${backendUrl}/payments/webhook`,
        statement_descriptor: 'ZIPPYZAP',
      };

      const result = await preference.create({
        body: preferenceData,
      });

      const payment = await this.prisma.payment.create({
        data: {
          userId,
          planId,
          mercadoPagoId: externalReference,
          preferenceId: result.id,
          amount: plan.price,
          status: PaymentStatus.PENDING,
          metadata: {
            preferenceId: result.id,
            externalReference,
          },
        },
      });

      this.logger.debug(
        `Payment preference created for user ${userId}, plan ${planId}`,
      );

      return {
        checkoutUrl: result.init_point,
        paymentId: payment.id,
        preferenceId: result.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create payment preference for user ${userId}: ${error.message}`,
      );
      throw new BadRequestException('Erro ao criar preferência de pagamento');
    }
  }

  validateWebhookSignature(
    data: Record<string, any>,
    signature: string,
    requestId: string,
  ): boolean {
    const secret = process.env.MP_WEBHOOK_SECRET || '';

    if (!secret) {
      this.logger.warn('MP_WEBHOOK_SECRET não configurado');
      return false;
    }

    const payload = `id=${data.data?.id};request-id=${requestId}`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = hash === signature;
    this.logger.debug(
      `Webhook signature validation: ${isValid ? 'valid' : 'invalid'}`,
    );
    return isValid;
  }

  async handleWebhook(data: any) {
    try {
      const notificationType = data.type || data.topic;

      if (notificationType !== 'payment') {
        return { received: true };
      }

      let paymentId = data.data?.id;

      if (!paymentId && data.resource) {
        const parts = data.resource.split('/');
        paymentId = parts[parts.length - 1];
      }

      if (!paymentId) {
        return { received: true };
      }

      const paymentMP = new MPPayment(this.mp);

      // Adicionar timeout de 10 segundos para requisição MercadoPago
      const paymentDataPromise = paymentMP.get({ id: paymentId });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MercadoPago API timeout')), 10000),
      );

      const paymentData = await Promise.race([
        paymentDataPromise as Promise<any>,
        timeoutPromise as Promise<any>,
      ]);

      const externalReference = paymentData.external_reference;

      if (!externalReference) {
        return { received: true };
      }

      const payment = await this.prisma.payment.findFirst({
        where: { mercadoPagoId: externalReference },
        include: { user: true },
      });

      if (!payment) {
        return { received: true };
      }

      // Proteção contra webhooks duplicados
      // Se payment já foi processado, retornar sucesso sem processar novamente
      if (payment.status !== PaymentStatus.PENDING) {
        this.logger.debug(
          `Webhook duplicado ignorado para payment ${payment.id}`,
        );
        return { received: true, status: 'already_processed' };
      }

      // Mapear status do MercadoPago com tratamento de todos os estados
      const statusMap: Record<string, PaymentStatus> = {
        approved: PaymentStatus.APPROVED,
        pending: PaymentStatus.PENDING,
        in_process: PaymentStatus.PENDING,
        rejected: PaymentStatus.REJECTED,
        cancelled: PaymentStatus.CANCELLED,
        refunded: PaymentStatus.REFUNDED,
      };

      const status: PaymentStatus =
        statusMap[paymentData.status] ?? PaymentStatus.PENDING;

      // Atualizar pagamento com novo status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          paymentType: paymentData.payment_type_id,
          paymentMethod: paymentData.payment_method_id,
          metadata: {
            ...(payment.metadata as object),
            mercadoPagoPaymentId: paymentData.id,
            statusDetail: paymentData.status_detail,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      // Ativar subscription apenas se pagamento foi aprovado
      // (já está protegido contra duplicação pela verificação de payment.status)
      if (status === PaymentStatus.APPROVED) {
        await this.activateSubscription(
          payment.userId,
          payment.planId,
          payment.id,
        );
      }

      return { received: true, status };
    } catch (error) {
      // Log detalhado do erro
      if (error instanceof Error) {
        this.logger.error(`Webhook processing error: ${error.message}`, {
          stack: error.stack,
          paymentId: data?.data?.id,
        });
      } else {
        this.logger.error('Unknown webhook processing error');
      }

      // Retornar sucesso para evitar retentativas infinitas do MercadoPago
      return {
        received: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async activateSubscription(
    userId: number,
    planId: number,
    paymentId: number,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const existingSubscription = await tx.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
      });

      let startDate = new Date();
      let endDate = new Date();

      if (existingSubscription) {
        const now = new Date();
        const existingEndDate = new Date(existingSubscription.endDate);

        if (existingEndDate > now) {
          startDate = existingEndDate;
          endDate = new Date(existingEndDate);
          endDate.setDate(endDate.getDate() + 30);
        } else {
          endDate.setDate(endDate.getDate() + 30);
        }

        await tx.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: 'CANCELLED' },
        });
      } else {
        endDate.setDate(endDate.getDate() + 30);
      }

      const subscription = await tx.subscription.create({
        data: {
          userId,
          planId,
          paymentId,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { planId },
      });

      this.logger.debug(`Subscription activated for user ${userId}`);
      return subscription;
    });
  }

  async getPaymentStatus(paymentId: number, userId: number) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
      },
      include: {
        subscriptions: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return {
      status: payment.status,
      payment,
    };
  }

  async getUserSubscription(userId: number) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        user: {
          include: {
            Plan: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscription;
  }
}
