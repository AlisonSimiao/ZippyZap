import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { createApp } from '../src/app';
import { prisma, cleanupDatabase, seedPlans, disconnect } from './setup';

const app = createApp();

describe('Plan Routes', () => {
  beforeAll(async () => {
    await cleanupDatabase();
    await seedPlans();
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('GET /plans', () => {
    it('should return all active plans', async () => {
      const response = await app.handle(new Request('http://localhost/plans'));
      expect(response.status).toBe(200);

      const plans = await response.json();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });

    it('should include plan details', async () => {
      const response = await app.handle(new Request('http://localhost/plans'));
      const plans = await response.json();

      const basicPlan = plans.find((p: any) => p.name === 'Básico');
      expect(basicPlan).toBeDefined();
      expect(basicPlan.dailyLimit).toBe(500);
      expect(basicPlan.monthlyLimit).toBe(5000);
      expect(basicPlan.sessionLimit).toBe(1);
    });

    it('should not return inactive plans', async () => {
      await prisma.plan.update({
        where: { name: 'Gratuito' },
        data: { isActive: false },
      });

      const response = await app.handle(new Request('http://localhost/plans'));
      const plans = await response.json();
      
      const inactivePlan = plans.find((p: any) => p.name === 'Gratuito');
      expect(inactivePlan).toBeUndefined();

      await prisma.plan.update({
        where: { name: 'Gratuito' },
        data: { isActive: true },
      });
    });

    it('should order plans by price', async () => {
      const response = await app.handle(new Request('http://localhost/plans'));
      const plans = await response.json();

      for (let i = 1; i < plans.length; i++) {
        expect(plans[i].price).toBeGreaterThanOrEqual(plans[i - 1].price);
      }
    });
  });
});
