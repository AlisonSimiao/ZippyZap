import { Injectable } from '@nestjs/common';
import {
  ThrottlerGuard as NestThrottlerGuard,
  ThrottlerRequest,
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { ThrottleMetadata } from '../decorators/throttle.decorator';

@Injectable()
export class CustomThrottlerGuard extends NestThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    // ✅ Verificar se há decorador @Throttle customizado
    const throttleMetadata = this.reflector.get<ThrottleMetadata>(
      'throttle',
      requestProps.context.getHandler(),
    );

    if (throttleMetadata) {
      // ✨ Usar limite customizado do decorador
      return super.handleRequest({
        ...requestProps,
        limit: throttleMetadata.limit,
        ttl: throttleMetadata.ttl,
      });
    }

    // ⚙️ Usar limite padrão do ThrottlerModule
    return super.handleRequest(requestProps);
  }
}
