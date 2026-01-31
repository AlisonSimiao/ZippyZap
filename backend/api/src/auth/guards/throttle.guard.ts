import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends NestThrottlerGuard {
  async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    // Apply throttling to all endpoints
    return super.handleRequest(requestProps);
  }
}
