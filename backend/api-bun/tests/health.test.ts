import { describe, it, expect, afterAll } from 'bun:test';
import { createApp } from '../src/app';
import { disconnect } from './setup';

const app = createApp();

describe('Health Routes', () => {
  afterAll(async () => {
    await disconnect();
  });

  it('GET / should return API info', async () => {
    const response = await app.handle(new Request('http://localhost/'));
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.name).toBe('ZippyZap API');
    expect(body.version).toBe('2.0.0');
    expect(body.runtime).toBe('Bun');
  });

  it('GET /health should return health status', async () => {
    const response = await app.handle(new Request('http://localhost/health'));
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  it('GET /health should include checks object', async () => {
    const response = await app.handle(new Request('http://localhost/health'));
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body.checks).toBeDefined();
    expect(body.checks.redis).toBeDefined();
  });
});
