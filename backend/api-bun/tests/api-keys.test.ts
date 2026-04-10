import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { createApp } from '../src/app';
import { prisma, seedTestData, cleanupDatabase, disconnect } from './setup';
import type { User, ApiKey } from '@prisma/client';

const app = createApp();

describe('API Key Routes', () => {
  let user: User;
  let jwtToken: string;

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
    await disconnect();
  });

  describe('POST /api-keys', () => {
    it('should create a new API key', async () => {
      const response = await app.handle(
        new Request('http://localhost/api-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            name: 'My New API Key',
          }),
        }),
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.token).toBeDefined();
      expect(body.name).toBe('My New API Key');
      expect(body.token.startsWith('zzw-')).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await app.handle(
        new Request('http://localhost/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Unauthorized Key',
          }),
        }),
      );

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api-keys', () => {
    it('should list user API keys', async () => {
      const response = await app.handle(
        new Request('http://localhost/api-keys', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api-keys/:name', () => {
    it('should update API key name', async () => {
      const createResponse = await app.handle(
        new Request('http://localhost/api-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            name: 'Original Name',
          }),
        }),
      );
      const created = await createResponse.json();

      const response = await app.handle(
        new Request(`http://localhost/api-keys/${encodeURIComponent(created.name)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            name: 'Updated Name',
          }),
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.name).toBe('Updated Name');
    });

    it('should revoke API key', async () => {
      const createResponse = await app.handle(
        new Request('http://localhost/api-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            name: 'Key To Revoke',
          }),
        }),
      );
      const created = await createResponse.json();

      const response = await app.handle(
        new Request(`http://localhost/api-keys/${encodeURIComponent(created.name)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            status: 'REVOKED',
          }),
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('REVOKED');
    });
  });

  describe('DELETE /api-keys/:name', () => {
    it('should delete API key', async () => {
      const createResponse = await app.handle(
        new Request('http://localhost/api-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            name: 'Key To Delete',
          }),
        }),
      );
      const created = await createResponse.json();

      const deleteResponse = await app.handle(
        new Request(`http://localhost/api-keys/${encodeURIComponent(created.name)}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }),
      );

      expect(deleteResponse.status).toBe(200);
    });

    it('should return 404 for non-existent key', async () => {
      const response = await app.handle(
        new Request('http://localhost/api-keys/nonexistent-key-123', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }),
      );

      expect(response.status).toBe(404);
    });
  });
});
