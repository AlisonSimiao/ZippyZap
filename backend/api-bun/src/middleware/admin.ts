import { ForbiddenException } from '../types';

/**
 * Admin check — replaces NestJS AdminGuard
 *
 * Verifies user email is in ADMIN_EMAILS env var.
 */
export function checkAdmin(userEmail: string | undefined): void {
  if (!userEmail) {
    throw new ForbiddenException('User not authenticated');
  }

  const adminEmails = Bun.env.ADMIN_EMAILS?.split(',') || [];

  if (!adminEmails.includes(userEmail)) {
    throw new ForbiddenException(
      'Admin access required. Contact support for assistance.',
    );
  }
}
