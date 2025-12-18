import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private whatsappService: WhatsappService,
  ) {}

  async sendMessage(userId: number, to: string, message: string) {
    await this.whatsappService.sendMessage(userId.toString(), to, message);
    return { success: true };
  }

  async getOverview(userId: number) {
    const [user, messages, webhooks, webhookLogs] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          Plan: true,
          ApiKeys: true,
          webhooks: true,
        },
      }),
      this.prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.webhook.findMany({
        where: { userId },
      }),
      this.prisma.webhookLog.findMany({
        where: { webhook: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { webhook: true },
      }),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messagesToday = await this.prisma.message.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    const messagesSent = await this.prisma.message.count({
      where: {
        userId,
        createdAt: { gte: today },
        status: 'SENT',
      },
    });

    const messagesReceived = await this.prisma.message.count({
      where: {
        userId,
        createdAt: { gte: today },
        status: 'DELIVERED', // Assuming DELIVERED is for received or we need another status?
        // Actually, usually 'SENT' is outgoing. 'RECEIVED' might not be in enum yet or handled differently.
        // Let's check MessageStatus enum.
      },
    });

    // Instance Status
    const instanceStatus = await this.userService.getStatus(userId.toString());

    // Combine logs
    const logs = [
      ...messages.map((m) => ({
        type: 'message',
        action: `Mensagem ${m.status.toLowerCase()} `,
        time: m.createdAt,
        status: m.status === 'FAILED' ? 'error' : 'success',
        details: m.to,
      })),
      ...webhookLogs.map((l) => ({
        type: 'webhook',
        action: `Webhook ${l.event} `,
        time: l.createdAt,
        status: l.status >= 200 && l.status < 300 ? 'success' : 'error',
        details: l.status.toString(),
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 10);

    return {
      stats: {
        apiKeys: user.ApiKeys.length,
        messagesToday,
        planLimit: user.Plan.dailyLimit,
        instanceStatus: instanceStatus.status,
      },
      usage: {
        current: messagesToday,
        limit: user.Plan.dailyLimit,
        percentage: (messagesToday / (user.Plan.dailyLimit || 1)) * 100,
      },
      recentActivity: logs,
      metrics: {
        sent: messagesSent,
        received: 0, // Placeholder until we confirm how received messages are stored
        webhooks: webhookLogs.length,
        errors: webhookLogs.filter((l) => l.status >= 400).length,
      },
    };
  }
}
