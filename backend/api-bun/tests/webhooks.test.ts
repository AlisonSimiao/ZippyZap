import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { createApp } from '../src/app';
import { prisma, seedTestData, cleanupDatabase } from './setup';
import type { User } from '@prisma/client';

const app = createApp();

let user: User;
let jwtToken: string;

describe('Webhook Routes', () => {
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

    await prisma.event.createMany({
      data: [
        { name: 'QR Code', slug: 'qr' },
        { name: 'Session Connected', slug: 'session.connected' },
        { name: 'Message Received', slug: 'message.received' },
        { name: 'Message Sent', slug: 'message.sent' },
      ],
    });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe('POST /webhooks', () => {
    it('should create a webhook', async () => {
      const response = await app.handle(
        new Request('http://localhost/webhooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            url: 'https://example.com/webhook',
            name: 'My Webhook',
            events: ['qr', 'message.received'],
          }),
        }),
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.url).toBe('https://example.com/webhook');
      expect(body.name).toBe('My Webhook');
    });

    it('should reject invalid URL', async () => {
      const response = await app.handle(
        new Request('http://localhost/webhooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            url: 'http://localhost:3000/webhook',
            name: 'Invalid Webhook',
          }),
        }),
      );

      expect(response.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const response = await app.handle(
        new Request('http://localhost/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: 'https://example.com/webhook',
          }),
        }),
      );

      expect(response.status).toBe(403);
    });
  });

  describe('GET /webhooks', () => {
    it('should return user webhook', async () => {
      await app.handle(
        new Request('http://localhost/webhooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            url: 'https://example.com/webhook',
            name: 'Test Webhook',
          }),
        }),
      );

      const response = await app.handle(
        new Request('http://localhost/webhooks', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.url).toBe('https://example.com/webhook');
    });
  });

  describe('GET /webhooks/events', () => {
    it('should return all available events', async () => {
      const response = await app.handle(
        new Request('http://localhost/webhooks/events', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }),
      );

      expect(response.status).toBe(200);
      const events = await response.json();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /webhooks/:id', () => {
    it('should update webhook', async () => {
      const createResponse = await app.handle(
        new Request('http://localhost/webhooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            url: 'https://example.com/old-webhook',
            name: 'Old Name',
          }),
        }),
      );
      const webhook = await createResponse.json();

      const response = await app.handle(
        new Request(`http://localhost/webhooks/${webhook.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            url: 'https://example.com/new-webhook',
            name: 'New Name',
          }),
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.url).toBe('https://example.com/new-webhook');
      expect(body.name).toBe('New Name');
    });
  });

  describe('POST /webhooks/wuzapi', () => {
    it('should receive WuzAPI webhook', async () => {
      const response = await app.handle(
        new Request('http://localhost/webhooks/wuzapi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'QR',
            instanceName: 'test-user',
            userID: 'test-user',
            qrCodeBase64: 'data:image/png;base64,abc123',
          }),
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('should handle message events', async () => {
      const response = await app.handle(
        new Request('http://localhost/webhooks/wuzapi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'Message',
            instanceName: 'test-user',
            userID: 'test-user',
            event: {
              Info: {
                ID: 'msg123',
                Chat: '5511999999999@s.whatsapp.net',
                SenderAlt: '5511999999999@s.whatsapp.net',
                Timestamp: Date.now(),
                Type: 'text',
              },
              Message: {
                conversation: 'Hello from test!',
              },
            },
          }),
        }),
      );

      expect(response.status).toBe(200);
    });
  });
});
