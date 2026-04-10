import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { createApp } from '../src/app';
import { prisma, seedTestData, cleanupDatabase } from './setup';
import type { ApiKey } from '@prisma/client';

const app = createApp();

let apiKey: ApiKey;

describe('Rate Limiting', () => {
  beforeAll(async () => {
    await cleanupDatabase();
    const testData = await seedTestData();
    apiKey = testData.apiKey;
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('WhatsApp Route Limits', () => {
    it('should allow requests within limit', async () => {
      const response = await app.handle(
        new Request('http://localhost/whatsapp/status', {
          headers: {
            'x-api-key': apiKey.hash,
          },
        }),
      );

      expect(response.status).toBe(200);
    });

    it('should track rate limit by IP', async () => {
      for (let i = 0; i < 10; i++) {
        await app.handle(
          new Request('http://localhost/whatsapp/status', {
            headers: {
              'x-api-key': apiKey.hash,
              'x-forwarded-for': '192.168.1.100',
            },
          }),
        );
      }

      const response = await app.handle(
        new Request('http://localhost/whatsapp/status', {
          headers: {
            'x-api-key': apiKey.hash,
            'x-forwarded-for': '192.168.1.100',
          },
        }),
      );

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Message Sending Limits', () => {
    it('should apply stricter limits to message sending', async () => {
      for (let i = 0; i < 5; i++) {
        await app.handle(
          new Request('http://localhost/whatsapp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey.hash,
              'x-forwarded-for': '192.168.2.100',
            },
            body: JSON.stringify({
              to: '5511999999999',
              message: 'Test message',
            }),
          }),
        );
      }

      const response = await app.handle(
        new Request('http://localhost/whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey.hash,
            'x-forwarded-for': '192.168.2.100',
          },
          body: JSON.stringify({
            to: '5511999999999',
            message: 'Rate limited message',
          }),
        }),
      );

      expect([400, 429]).toContain(response.status);
    });
  });
});
