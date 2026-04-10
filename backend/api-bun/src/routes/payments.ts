import { Elysia, t } from 'elysia';
import { prisma } from '../services/prisma';
import { getMercadoPagoConfig } from '../services/mercadopago';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '../types';
import { PaymentStatus } from '@prisma/client';
import { redisDel } from '../services/redis';
import * as crypto from 'crypto';

export const paymentRoutes = new Elysia()
  // ─── Create Payment ────────────────────────────────────────────
  .post(
    '/payments/create',
    async (ctx: any) => {
      const user = ctx.user;
      const body = ctx.body;
      if (!user) throw new ForbiddenException('Not authenticated');

      const plan = await prisma.plan.findUnique({
        where: { id: body.planId },
      });

      if (!plan) throw new NotFoundException('Plano não encontrado');
      if (!plan.isActive)
        throw new BadRequestException('Plano não está ativo');

      const price = parseFloat(plan.price.toString());
      if (isNaN(price) || price <= 0) {
        throw new BadRequestException('Preço do plano inválido');
      }

      const baseUrl = Bun.env.FRONTEND_URL || 'http://localhost:3000';
      const backendUrl = Bun.env.BACKEND_URL || 'http://localhost:8080';

      const { Preference } = await import('mercadopago');
      const mp = getMercadoPagoConfig();
      const preference = new Preference(mp);

      const externalReference = `payment_${user.id}_${body.planId}_${Date.now()}`;

      try {
        const result = await preference.create({
          body: {
            items: [
              {
                id: body.planId.toString(),
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
          },
        });

        const payment = await prisma.payment.create({
          data: {
            userId: user.id,
            planId: body.planId,
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

        return {
          checkoutUrl: result.init_point,
          paymentId: payment.id,
          preferenceId: result.id,
        };
      } catch (error) {
        console.error(
          `Failed to create payment preference for user ${user.id}:`,
          error,
        );
        throw new BadRequestException(
          'Erro ao criar preferência de pagamento',
        );
      }
    },
    {
      body: t.Object({
        planId: t.Number(),
      }),
    },
  )
  // ─── Payment Webhook (Public) ──────────────────────────────────
  .post('/payments/webhook', async ({ body, headers }) => {
    const signature = headers['x-signature'] as string;
    const requestId = headers['x-request-id'] as string;

    if (!signature || !requestId) {
      throw new UnauthorizedException('Assinatura inválida');
    }

    const data = body as Record<string, any>;
    const secret = Bun.env.MP_WEBHOOK_SECRET || '';

    // Validate signature
    const payload = `id=${data.data?.id};request-id=${requestId}`;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (hash !== signature) {
      throw new UnauthorizedException('Assinatura inválida');
    }

    // Process webhook
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
      if (!paymentId) return { received: true };

      const { Payment: MPPayment } = await import('mercadopago');
      const mp = getMercadoPagoConfig();
      const paymentMP = new MPPayment(mp);

      // Fetch payment from MercadoPago with timeout
      const paymentDataPromise = paymentMP.get({ id: paymentId });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MercadoPago API timeout')), 10000),
      );

      const paymentData = (await Promise.race([
        paymentDataPromise,
        timeoutPromise,
      ])) as any;

      const externalReference = paymentData.external_reference;
      if (!externalReference) return { received: true };

      const payment = await prisma.payment.findFirst({
        where: { mercadoPagoId: externalReference },
        include: { user: true },
      });

      if (!payment) return { received: true };

      // Skip already processed
      if (payment.status !== PaymentStatus.PENDING) {
        return { received: true, status: 'already_processed' };
      }

      const statusMap: Record<string, PaymentStatus> = {
        approved: PaymentStatus.APPROVED,
        pending: PaymentStatus.PENDING,
        in_process: PaymentStatus.PENDING,
        rejected: PaymentStatus.REJECTED,
        cancelled: PaymentStatus.CANCELLED,
        refunded: PaymentStatus.REFUNDED,
      };

      const status =
        statusMap[paymentData.status] ?? PaymentStatus.PENDING;

      await prisma.payment.update({
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

      if (status === PaymentStatus.APPROVED) {
        await activateSubscription(
          payment.userId,
          payment.planId,
          payment.id,
        );
      }

      return { received: true, status };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        received: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  })
  // ─── Payment Status ────────────────────────────────────────────
  .get('/payments/status/:paymentId', async (ctx: any) => {
    const user = ctx.user;
    const params = ctx.params;
    if (!user) throw new ForbiddenException('Not authenticated');

    const payment = await prisma.payment.findFirst({
      where: {
        id: parseInt(params.paymentId),
        userId: user.id,
      },
      include: { subscriptions: true },
    });

    if (!payment) throw new NotFoundException('Pagamento não encontrado');

    return { status: payment.status, payment };
  })
  // ─── Current Subscription ─────────────────────────────────────
  .get('/subscriptions/current', async (ctx: any) => {
    const user = ctx.user;
    if (!user) throw new ForbiddenException('Not authenticated');

    return prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: {
        user: { include: { Plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

// ─── Subscription Activation ───────────────────────────────────────

async function activateSubscription(
  userId: number,
  planId: number,
  paymentId: number,
) {
  const subscription = await prisma.$transaction(async (tx) => {
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

    const sub = await tx.subscription.create({
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

    return sub;
  });

  // Invalidate API Key cache after subscription activation
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: { hash: true },
    });

    for (const apiKey of apiKeys) {
      await redisDel(`apiKey:${apiKey.hash}`);
    }
  } catch (error) {
    console.error('Failed to invalidate API key cache:', error);
  }

  return subscription;
}
