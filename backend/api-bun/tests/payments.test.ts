import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { createApp } from '../src/app';
import { prisma, seedTestData, cleanupDatabase } from './setup';
import type { User } from '@prisma/client';

const app = createApp();

let user: User;
let jwtToken: string;

describe('Payment Routes', () => {
  beforeAll(async () => {
    await cleanupDatabase();
    const testData = await seedTestData();
    user = testData.user;

    const response = await app.handle(
      new Request('http://localhost/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      }),
    );
    const data = await response.json();
    jwtToken = data.token;
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('POST /payments/create', () => {
    it('should require authentication', async () => {
      const response = await app.handle(
        new Request('http://localhost/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: 2,
          }),
        }),
      );

      expect(response.status).toBe(403);
    });

    it('should require planId', async () => {
      const response = await app.handle(
        new Request('http://localhost/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({}),
        }),
      );

      expect(response.status).toBe(422);
    });
  });

  describe('POST /payments/webhook (MercadoPago)', () => {
    it('should accept MercadoPago webhook without auth', async () => {
      const response = await app.handle(
        new Request('http://localhost/payments/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'payment.created',
            data: {
              id: '123456789',
            },
          }),
        }),
      );

      expect(response.status).toBe(200);
    });
  });

  describe('GET /subscriptions/current', () => {
    it('should return empty subscription for new user', async () => {
      const response = await app.handle(
        new Request('http://localhost/subscriptions/current', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toBeNull();
    });

    it('should return active subscription when exists', async () => {
      const plan = await prisma.plan.findUnique({ where: { name: 'Básico' } });
      
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          planId: plan!.id,
          mercadoPagoId: 'mp-test-123',
          amount: plan!.price,
          status: 'APPROVED',
        },
      });

      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan!.id,
          paymentId: payment.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      const response = await app.handle(
        new Request('http://localhost/subscriptions/current', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).not.toBeNull();
      expect(body.status).toBe('ACTIVE');
    });
  });
});
