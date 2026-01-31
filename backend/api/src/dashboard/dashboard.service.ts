import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { RedisService } from 'src/redis/redis.service';
import { format } from 'date-fns';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private whatsappService: WhatsappService,
    private redis: RedisService,
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
        received: 0,
        webhooks: webhookLogs.length,
        errors: webhookLogs.filter((l) => l.status >= 400).length,
      },
    };
  }

  /**
   * Admin: Reset usage counters for a user
   * Deletes all Redis keys for daily/monthly usage
   */
  async adminResetUsage(userId: number, adminId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Deletar todas as chaves de uso (diário e mensal)
    const deletedDaily = await this.redis.deletePattern(
      `usage:daily:${userId}:*`,
    );
    const deletedMonthly = await this.redis.deletePattern(
      `usage:monthly:${userId}:*`,
    );

    this.logger.warn(
      `Admin usage reset: user=${userId}, admin=${adminId}, deleted_daily=${deletedDaily}, deleted_monthly=${deletedMonthly}`,
    );

    return {
      success: true,
      userId,
      deletedDailyKeys: deletedDaily,
      deletedMonthlyKeys: deletedMonthly,
      message: `Usage counters reset for user ${user.email}`,
    };
  }

  /**
   * Admin: Get detailed usage for a user on a specific date
   */
  async adminGetUsageDetail(userId: number, date?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { Plan: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const targetDate = date ? new Date(date) : new Date();
    const dateKey = format(targetDate, 'yyyy-MM-dd');
    const monthKey = format(targetDate, 'yyyy-MM');

    const dailyUsage = await this.redis.get(`usage:daily:${userId}:${dateKey}`);
    const monthlyUsage = await this.redis.get(
      `usage:monthly:${userId}:${monthKey}`,
    );

    const dailyCount = dailyUsage ? parseInt(dailyUsage, 10) : 0;
    const monthlyCount = monthlyUsage ? parseInt(monthlyUsage, 10) : 0;

    return {
      userId,
      user: {
        email: user.email,
        name: user.name,
        planName: user.Plan.name,
      },
      date: dateKey,
      month: monthKey,
      usage: {
        daily: {
          current: dailyCount,
          limit: user.Plan.dailyLimit,
          percentage: (dailyCount / (user.Plan.dailyLimit || 1)) * 100,
        },
        monthly: {
          current: monthlyCount,
          limit: user.Plan.monthlyLimit,
          percentage: (monthlyCount / (user.Plan.monthlyLimit || 1)) * 100,
        },
      },
    };
  }

  /**
   * Admin: Manually set usage limit for a user (for emergencies)
   */
  async adminSetUsageLimit(
    userId: number,
    dateKey: string,
    newLimit: number,
    adminId: number,
  ) {
    if (newLimit < 0) {
      throw new Error('Limit cannot be negative');
    }

    const key = `usage:daily:${userId}:${dateKey}`;

    if (newLimit === 0) {
      await this.redis.delete(key);
    } else {
      const ttl = await this.redis.expire(key, 86400 * 2);
      await this.redis.set(key, newLimit.toString());
    }

    this.logger.warn(
      `Admin set usage limit: user=${userId}, date=${dateKey}, newLimit=${newLimit}, admin=${adminId}`,
    );

    return {
      success: true,
      userId,
      dateKey,
      newLimit,
      message: `Usage limit set to ${newLimit} for ${dateKey}`,
    };
  }
}
