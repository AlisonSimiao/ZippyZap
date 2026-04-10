import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { createApp } from '../src/app';
import { prisma, seedTestData, cleanupDatabase, disconnect } from './setup';

const app = createApp();

describe('Auth Routes', () => {
  beforeAll(async () => {
    await cleanupDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'password123',
            whatsapp: '5511888888888',
            name: 'New User',
          }),
        }),
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe('newuser@example.com');
    });

    it('should reject duplicate email', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            whatsapp: '5511777777777',
          }),
        }),
      );

      expect(response.status).toBe(409);
    });

    it('should reject invalid email format', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'invalid-email',
            password: 'password123',
            whatsapp: '5511777777777',
          }),
        }),
      );

      expect(response.status).toBe(422);
    });

    it('should reject missing required fields', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
          }),
        }),
      );

      expect(response.status).toBe(422);
    });
  });

  describe('POST /auth/signin', () => {
    it('should login with valid credentials', async () => {
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

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe('test@example.com');
    });

    it('should reject invalid password', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword',
          }),
        }),
      );

      expect(response.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'nonexistent@example.com',
            password: 'password123',
          }),
        }),
      );

      expect(response.status).toBe(401);
    });
  });
});
