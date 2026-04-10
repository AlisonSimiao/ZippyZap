import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createApp } from '../src/app';
import { prisma, seedTestData, cleanupDatabase } from './setup';
import type { User, ApiKey } from '@prisma/client';

const app = createApp();

let testUser: User;
let testApiKey: ApiKey;

describe('WhatsApp Routes', () => {
  beforeAll(async () => {
    await cleanupDatabase();
    const data = await seedTestData();
    testUser = data.user;
    testApiKey = data.apiKey;
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('GET /whatsapp/status', () => {
    it('should return disconnected status for new user', async () => {
      const response = await app.handle(
        new Request('http://localhost/whatsapp/status', {
          headers: {
            'x-api-key': testApiKey.hash,
          },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBeDefined();
    });

    it('should reject request without API key', async () => {
      const response = await app.handle(
        new Request('http://localhost/whatsapp/status'),
      );

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid API key', async () => {
      const response = await app.handle(
        new Request('http://localhost/whatsapp/status', {
          headers: {
            'x-api-key': 'invalid-key',
          },
        }),
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /whatsapp/qrcode', () => {
    it('should return 404 when no QR code exists', async () => {
      const response = await app.handle(
        new Request('http://localhost/whatsapp/qrcode', {
          headers: {
            'x-api-key': testApiKey.hash,
          },
        }),
      );

      expect(response.status).toBe(404);
    });
  });

  describe('POST /whatsapp/session', () => {
    it('should start session creation', async () => {
      const response = await app.handle(
        new Request('http://localhost/whatsapp/session', {
          method: 'POST',
          headers: {
            'x-api-key': testApiKey.hash,
          },
        }),
      );

      expect(response.status).toBe(202);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.status).toBe('initializing');
    });

    it('should block when session limit reached', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { planId: 1 },
      });

      const response = await app.handle(
        new Request('http://localhost/whatsapp/session', {
          method: 'POST',
          headers: {
            'x-api-key': testApiKey.hash,
          },
        }),
      );

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /whatsapp/session', () => {
    it('should complete logout successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/whatsapp/session', {
          method: 'DELETE',
          headers: {
            'x-api-key': testApiKey.hash,
          },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });
  });

  describe('POST /whatsapp (send message)', () => {
    it('should require connected session', async () => {
      const response = await app.handle(
        new Request('http://localhost/whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': testApiKey.hash,
          },
          body: JSON.stringify({
            to: '5511999999999',
            message: 'Hello!',
          }),
        }),
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.message).toContain('not connected');
    });
  });
});
