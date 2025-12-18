import {
  Injectable,
  ThrottlerGuard as NestThrottlerGuard,
  ExecutionContext,
} from '@nestjs/common';
import { ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends NestThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: ThrottlerLimitDetail,
  ): Promise<boolean> {
    // Apply throttling to all endpoints
    return super.handleRequest(context, limit, ttl, throttler);
  }
}
