import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Verificar se é admin (por enquanto usando email hardcoded)
    // TODO: Adicionar role de admin ao banco de dados
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    if (!adminEmails.includes(user.email)) {
      throw new ForbiddenException(
        'Admin access required. Contact support for assistance.',
      );
    }

    return true;
  }
}
