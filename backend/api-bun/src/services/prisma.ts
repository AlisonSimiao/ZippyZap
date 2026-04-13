import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      Bun.env.NODE_ENV === 'production'
        ? ['error']
        : ['info', 'warn', 'error'],
  });

if (Bun.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
