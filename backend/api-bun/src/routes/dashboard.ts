import { Elysia, t } from 'elysia';
import { prisma } from '../services/prisma';
import {
  redisGet,
  redisDel,
  redisSet,
  redisDeletePattern,
  redisExpire,
  redisSetWithExpiry,
} from '../services/redis';
import { checkAdmin } from '../middleware/admin';
import { addJob } from '../streams/producer';
import { ForbiddenException } from '../types';
import { format } from 'date-fns';

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })
  .get('/overview', async (ctx: any) => {
    const user = ctx.user;
    if (!user) {
      console.error('[DASHBOARD] User not found in context');
      throw new ForbiddenException('Not authenticated');
    }

    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const dailyUsageKey = `usage:daily:${user.id}:${todayStr}`;

      console.log(`[DASHBOARD] Fetching data for user ${user.id}`);

      const [dbUser, messages, webhookLogs, redisUsage] = await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          include: {
            Plan: true,
            ApiKeys: true,
            webhooks: true,
          },
        }),
        prisma.message.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.webhookLog.findMany({
          where: { webhook: { userId: user.id } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        redisGet(dailyUsageKey).catch(err => {
          console.error('[DASHBOARD] Redis error:', err);
          return null;
        }),
      ]);

      if (!dbUser) {
        console.error(`[DASHBOARD] User ${user.id} not found in database`);
        throw new Error('User not found');
      }

      const messagesToday = redisUsage ? parseInt(redisUsage, 10) : 0;
      
      const messagesSent = await prisma.message.count({
        where: {
          userId: user.id,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: 'SENT',
        },
      });

      const status = (await redisGet(`user:${user.id}:status`)) || 'disconnected';

      const logs = [
        ...messages.map((m) => ({
          type: 'message' as const,
          action: `Mensagem ${m.status.toLowerCase()} `,
          time: m.createdAt.toISOString(),
          status: m.status === 'FAILED' ? 'error' as const : 'success' as const,
          details: m.to,
        })),
        ...webhookLogs.map((l) => ({
          type: 'webhook' as const,
          action: `Webhook ${l.event} `,
          time: l.createdAt.toISOString(),
          status: l.status >= 200 && l.status < 300 ? 'success' as const : 'error' as const,
          details: l.status.toString(),
        })),
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);

      const result = {
        stats: {
          apiKeys: dbUser.ApiKeys.length,
          messagesToday,
          planLimit: dbUser.Plan.dailyLimit,
          instanceStatus: status,
        },
        usage: {
          current: messagesToday,
          limit: dbUser.Plan.dailyLimit,
          percentage: (messagesToday / (dbUser.Plan.dailyLimit || 1)) * 100,
        },
        recentActivity: logs,
        metrics: {
          sent: messagesSent,
          received: 0,
          webhooks: dbUser.webhooks.length,
          errors: webhookLogs.filter((l) => l.status >= 400).length,
        },
      };

      return result;
    } catch (error) {
      console.error('[DASHBOARD] Error building overview:', error);
      throw error;
    }
  })
  // ─── Send Message (from Dashboard) ─────────────────────────────
  .post(
    '/send-message',
    async ({ body, user }) => {
      if (!user) throw new ForbiddenException('Not authenticated');

      const status = await redisGet(`user:${user.id}:status`);
      if (status !== 'connected') {
        throw new ForbiddenException('User not connected to WhatsApp');
      }

      const phone = body.to.replace(/\D/g, '');

      await addJob('streams:send-message', {
        idUser: user.id.toString(),
        telefone: phone,
        text: body.message,
      });

      return { success: true };
    },
    {
      body: t.Object({
        to: t.String(),
        message: t.String(),
      }),
    },
  )
  // ─── Admin: Reset Usage ────────────────────────────────────────
  .post('/admin/reset-usage/:userId', async ({ params, user }) => {
    if (!user) throw new ForbiddenException('Not authenticated');
    checkAdmin(user.email);

    const targetUserId = parseInt(params.userId, 10);
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) throw new Error('User not found');

    const deletedDaily = await redisDeletePattern(
      `usage:daily:${targetUserId}:*`,
    );
    const deletedMonthly = await redisDeletePattern(
      `usage:monthly:${targetUserId}:*`,
    );

    console.warn(
      `Admin usage reset: user=${targetUserId}, admin=${user.id}, deleted_daily=${deletedDaily}, deleted_monthly=${deletedMonthly}`,
    );

    return {
      success: true,
      userId: targetUserId,
      deletedDailyKeys: deletedDaily,
      deletedMonthlyKeys: deletedMonthly,
      message: `Usage counters reset for user ${targetUser.email}`,
    };
  })
  // ─── Admin: Get Usage Detail ───────────────────────────────────
  .get('/admin/usage/:userId', async ({ params, query, user }) => {
    if (!user) throw new ForbiddenException('Not authenticated');
    checkAdmin(user.email);

    const targetUserId = parseInt(params.userId, 10);
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { Plan: true },
    });

    if (!targetUser) throw new Error('User not found');

    const targetDate = query.date ? new Date(query.date) : new Date();
    const dateKey = format(targetDate, 'yyyy-MM-dd');
    const monthKey = format(targetDate, 'yyyy-MM');

    const dailyUsage = await redisGet(`usage:daily:${targetUserId}:${dateKey}`);
    const monthlyUsage = await redisGet(
      `usage:monthly:${targetUserId}:${monthKey}`,
    );

    const dailyCount = dailyUsage ? parseInt(dailyUsage, 10) : 0;
    const monthlyCount = monthlyUsage ? parseInt(monthlyUsage, 10) : 0;

    return {
      userId: targetUserId,
      user: {
        email: targetUser.email,
        name: targetUser.name,
        planName: targetUser.Plan.name,
      },
      date: dateKey,
      month: monthKey,
      usage: {
        daily: {
          current: dailyCount,
          limit: targetUser.Plan.dailyLimit,
          percentage:
            (dailyCount / (targetUser.Plan.dailyLimit || 1)) * 100,
        },
        monthly: {
          current: monthlyCount,
          limit: targetUser.Plan.monthlyLimit,
          percentage:
            (monthlyCount / (targetUser.Plan.monthlyLimit || 1)) * 100,
        },
      },
    };
  })
  // ─── Admin: Set Usage Limit ────────────────────────────────────
  .post(
    '/admin/set-usage-limit/:userId',
    async ({ params, body, user }) => {
      if (!user) throw new ForbiddenException('Not authenticated');
      checkAdmin(user.email);

      const targetUserId = parseInt(params.userId, 10);

      if (body.newLimit < 0) throw new Error('Limit cannot be negative');

      const key = `usage:daily:${targetUserId}:${body.dateKey}`;

      if (body.newLimit === 0) {
        await redisDel(key);
      } else {
        await redisSet(key, body.newLimit.toString());
        await redisExpire(key, 86400 * 2);
      }

      console.warn(
        `Admin set usage limit: user=${targetUserId}, date=${body.dateKey}, newLimit=${body.newLimit}, admin=${user.id}`,
      );

      return {
        success: true,
        userId: targetUserId,
        dateKey: body.dateKey,
        newLimit: body.newLimit,
        message: `Usage limit set to ${body.newLimit} for ${body.dateKey}`,
      };
    },
    {
      body: t.Object({
        dateKey: t.String(),
        newLimit: t.Number(),
      }),
    },
  );
