import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para definir rate limit customizado por endpoint
 * @param limit Número de requisições permitidas
 * @param ttl Tempo em segundos para resetar o contador
 *
 * Uso:
 * @Throttle(100, 60)  // 100 req/min
 * async sendMessage() {}
 */
export const Throttle = (limit: number, ttl: number) =>
  SetMetadata('throttle', { limit, ttl });

export interface ThrottleMetadata {
  limit: number;
  ttl: number;
}
