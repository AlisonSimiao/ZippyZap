import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { join } from 'path';

const testDbUrl = `file:${join(import.meta.dir, '..', 'prisma', 'test-db', 'test.db')}`;

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl,
    },
  },
});

export const prisma = prismaClient as any;

export async function cleanupDatabase() {
  await prisma.webhookEvent.deleteMany();
  await prisma.webhookLog.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.message.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();
}

export async function seedPlans() {
  const plans = [
    { name: 'Gratuito', dailyLimit: 50, monthlyLimit: 500, sessionLimit: 1, price: 0, isActive: true },
    { name: 'Básico', dailyLimit: 500, monthlyLimit: 5000, sessionLimit: 1, price: 29.9, isActive: true },
    { name: 'Premium', dailyLimit: 2000, monthlyLimit: 20000, sessionLimit: 2, price: 99.9, isActive: true },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
}

export async function seedTestData() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      whatsapp: '5511999999999',
      password: hashedPassword,
      name: 'Test User',
      planId: 2,
    },
  });

  const apiKey = await prisma.apiKey.upsert({
    where: { hash: 'test-api-key-hash-123' },
    update: {},
    create: {
      hash: 'test-api-key-hash-123',
      userId: user.id,
      name: 'Test API Key',
      status: 'ACTIVE',
    },
  });

  await seedPlans();

  return { user, apiKey };
}

export async function initializeDatabase() {
  await prisma.$connect();
  
  try {
    await prisma.$executeRaw`SELECT 1`;
  } catch {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        whatsapp TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        is_active INTEGER DEFAULT 1,
        webhook_url TEXT,
        retention_days INTEGER DEFAULT 30,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        plan_id INTEGER DEFAULT 1
      )
    `;
  }
}

export async function disconnect() {
  await prisma.$disconnect();
}
