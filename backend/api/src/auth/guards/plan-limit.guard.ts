import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { format } from 'date-fns';
import { ApiKey, User } from '@prisma/client';

@Injectable()
export class PlanLimitGuard implements CanActivate {
  private readonly logger = new Logger(PlanLimitGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Support both JWT (req.user) and API Key (req.apiKey)
    const user = request.user;
    const apiKey = request.apiKey;
    const userId = user?.id || apiKey?.userId;

    if (!userId) {
      this.logger.warn('User ID not found in request context');
      return false;
    }

    let dailyLimit = 0;
    let monthlyLimit = 0;

    // Optimize: Use cached plan from ApiKeyMiddleware if available
    if (apiKey?.User?.Plan) {
      dailyLimit = apiKey.User.Plan.dailyLimit;
      monthlyLimit = apiKey.User.Plan.monthlyLimit;
    } else {
      // Fetch User Plan if not cached
      const userWithPlan = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { Plan: true },
      });

      if (!userWithPlan || !userWithPlan.Plan) {
        throw new ForbiddenException('User has no active plan');
      }
      dailyLimit = userWithPlan.Plan.dailyLimit;
      monthlyLimit = userWithPlan.Plan.monthlyLimit;
    }

    // Check Daily Limit
    if (dailyLimit > 0 && dailyLimit < 999999) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const dailyKey = `usage:daily:${userId}:${today}`;
      const dailyUsage = await this.redis.get(dailyKey);

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
      const monthlyUsage = await this.redis.get(monthlyKey);

      if (monthlyUsage && parseInt(monthlyUsage) >= monthlyLimit) {
        throw new ForbiddenException(
          `Monthly message limit reached (${monthlyLimit})`,
        );
      }
    }

    return true;
  }
}
