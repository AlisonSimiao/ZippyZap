import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import MercadoPagoConfig, {
  Preference,
  Payment as MPPayment,
} from 'mercadopago';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('MercadoPago') private readonly mp: MercadoPagoConfig,
    private readonly prisma: PrismaService,
  ) {}

  async createPaymentPreference(userId: number, planId: number) {
    // Buscar informações do plano
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (!plan.isActive) {
      throw new BadRequestException('Plano não está ativo');
    }

    // Buscar informações do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Gerar ID único para rastreamento
    const externalReference = `payment_${userId}_${planId}_${Date.now()}`;

    // Criar preferência de pagamento
    const preference = new Preference(this.mp);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    console.log('Frontend URL:', baseUrl);
    console.log('Backend URL:', backendUrl);

    const preferenceData = {
      items: [
        {
          id: planId.toString(),
          title: `Plano ${plan.name} - ZippyZap API`,
          description: `${plan.dailyLimit} mensagens/dia, ${plan.monthlyLimit} mensagens/mês`,
          quantity: 1,
          unit_price: Number(plan.price),
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`,
      },
      // auto_return removido para permitir localhost durante desenvolvimento
      // Em produção com domínio real, pode adicionar: auto_return: 'approved'
      payer: {
        email: user.email,
        name: user.name || undefined,
      },
      external_reference: externalReference,
      notification_url: `${backendUrl}/payments/webhook`,
      statement_descriptor: 'ZIPPYZAP',
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    };

    console.log(
      'Criando preferência com dados:',
      JSON.stringify(preferenceData, null, 2),
    );

    const result = await preference.create({
      body: preferenceData,
    });

    // Salvar registro de pagamento pendente
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

    return {
      checkoutUrl: result.init_point,
      paymentId: payment.id,
      preferenceId: result.id,
    };
  }

  async handleWebhook(data: any) {
    console.log('Webhook recebido:', JSON.stringify(data, null, 2));

    // Verificar o tipo de notificação
    // O Mercado Pago pode enviar 'type' ou 'topic'
    const notificationType = data.type || data.topic;

    if (notificationType !== 'payment') {
      console.log('Tipo de notificação ignorado:', notificationType);
      return { received: true };
    }

    try {
      // Extrair ID do pagamento
      // Pode vir em data.id ou resource (URL)
      let paymentId = data.data?.id;

      if (!paymentId && data.resource) {
        // Tentar extrair ID da URL resource se data.id não existir
        // Ex: https://api.mercadolibre.com/v1/payments/123456
        const parts = data.resource.split('/');
        paymentId = parts[parts.length - 1];
      }

      if (!paymentId) {
        console.log('ID do pagamento não encontrado no webhook');
        return { received: true };
      }

      // Buscar detalhes do pagamento no Mercado Pago
      const paymentMP = new MPPayment(this.mp);
      const paymentData = await paymentMP.get({ id: paymentId });

      console.log('Dados do pagamento:', JSON.stringify(paymentData, null, 2));

      const externalReference = paymentData.external_reference;

      if (!externalReference) {
        console.error('External reference não encontrado');
        return { received: true };
      }

      // Buscar pagamento no banco
      const payment = await this.prisma.payment.findFirst({
        where: {
          mercadoPagoId: externalReference,
        },
        include: {
          user: true,
        },
      });

      if (!payment) {
        console.error('Pagamento não encontrado no banco:', externalReference);
        return { received: true };
      }

      // Mapear status do Mercado Pago para nosso enum
      let status: PaymentStatus;
      switch (paymentData.status) {
        case 'approved':
          status = PaymentStatus.APPROVED;
          break;
        case 'rejected':
          status = PaymentStatus.REJECTED;
          break;
        case 'cancelled':
          status = PaymentStatus.CANCELLED;
          break;
        case 'refunded':
          status = PaymentStatus.REFUNDED;
          break;
        default:
          status = PaymentStatus.PENDING;
      }

      // Atualizar pagamento
      const updatedPayment = await this.prisma.payment.update({
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

      // Se pagamento aprovado, criar/ativar assinatura
      if (status === PaymentStatus.APPROVED) {
        await this.activateSubscription(
          payment.userId,
          payment.planId,
          payment.id,
        );
      }

      return { received: true, status };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  private async activateSubscription(
    userId: number,
    planId: number,
    paymentId: number,
  ) {
    // Verificar se já existe assinatura ativa
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    // Calcular data de início e fim da nova assinatura
    let startDate = new Date();
    let endDate = new Date();

    if (existingSubscription) {
      const now = new Date();
      const existingEndDate = new Date(existingSubscription.endDate);

      // Se a assinatura ainda está válida (não expirou)
      if (existingEndDate > now) {
        // Começar a nova assinatura quando a atual terminar
        startDate = existingEndDate;
        endDate = new Date(existingEndDate);
        endDate.setDate(endDate.getDate() + 30);

        console.log(
          `Renovação antecipada: assinatura atual válida até ${existingEndDate.toISOString()}`,
        );
        console.log(
          `Nova assinatura começará em ${startDate.toISOString()} e terminará em ${endDate.toISOString()}`,
        );
      } else {
        // Assinatura expirada, começar imediatamente
        endDate.setDate(endDate.getDate() + 30);
      }

      // Cancelar a assinatura anterior
      await this.prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: 'CANCELLED' },
      });
    } else {
      // Primeira assinatura, começar imediatamente
      endDate.setDate(endDate.getDate() + 30);
    }

    // Criar nova assinatura
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        paymentId,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
    });

    // Atualizar plano do usuário
    await this.prisma.user.update({
      where: { id: userId },
      data: { planId },
    });

    console.log('Assinatura ativada:', subscription);

    return subscription;
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
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          include: {
            Plan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscription;
  }
}
