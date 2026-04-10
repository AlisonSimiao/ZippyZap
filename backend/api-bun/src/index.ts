import { createApp } from './app';
import { startWorkers } from './workers';

// ─── Validate required env vars ────────────────────────────────────
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'MP_WEBHOOK_SECRET',
  'MP_ACCESS_TOKEN',
];

const missing = requiredEnvVars.filter((v) => !Bun.env[v]);
if (missing.length > 0) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// ─── Start app ─────────────────────────────────────────────────────
const port = Number(Bun.env.PORT) || 8080;

const app = createApp().listen(port);

console.log(`✅ Server running on http://localhost:${port}`);
console.log(`✅ Swagger docs at http://localhost:${port}/swagger`);
console.log(`✅ Environment variables validated`);

// ─── Start workers (Redis Streams consumers) ───────────────────────
startWorkers().catch((err) => {
  console.error('❌ Failed to start workers:', err);
});
