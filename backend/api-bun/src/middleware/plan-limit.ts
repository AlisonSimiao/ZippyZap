import { redisGet } from '../services/redis';
import { ForbiddenException } from '../types';
import { format } from 'date-fns';

/**
 * Plan limit check — replaces NestJS PlanLimitGuard
 *
 * Checks daily and monthly usage counters in Redis against plan limits.
 */
export async function checkPlanLimits(
  userId: number,
  dailyLimit: number,
  monthlyLimit: number,
): Promise<void> {
  // Check Daily Limit
  if (dailyLimit > 0 && dailyLimit < 999999) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dailyKey = `usage:daily:${userId}:${today}`;
    const dailyUsage = await redisGet(dailyKey);

    if (dailyUsage && parseInt(dailyUsage) >= dailyLimit) {
      throw new ForbiddenException(
        `Daily message limit reached (${dailyLimit})`,
      );
    }
  }

  // Check Monthly Limit
  if (monthlyLimit > 0 && monthlyLimit < 999999) {
    const month = format(new Date(), 'yyyy-MM');
    const monthlyKey = `usage:monthly:${userId}:${month}`;
    const monthlyUsage = await redisGet(monthlyKey);

    if (monthlyUsage && parseInt(monthlyUsage) >= monthlyLimit) {
      throw new ForbiddenException(
        `Monthly message limit reached (${monthlyLimit})`,
      );
    }
  }
}
