import { Elysia } from 'elysia';
import { prisma } from '../services/prisma';

export const planRoutes = new Elysia({ prefix: '/plans' }).get('/', async () => {
  return prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      dailyLimit: true,
      monthlyLimit: true,
      sessionLimit: true,
      price: true,
    },
    orderBy: { price: 'asc' },
  });
});
