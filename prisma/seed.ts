import { Logger } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

async function createPlains(logger: Logger) {
  logger.log('Creating plains...');

  const plains = [
    {
      name: 'Gratuito',
      dailyLimit: 20,
      monthlyLimit: 700,
      price: 0,
      features: ['API'],
    },
    {
      name: 'Básico',
      dailyLimit: 1000,
      monthlyLimit: 20000,
      price: 29.9,
      features: ['API', 'Webhooks'],
    },
    {
      name: 'Premium',
      dailyLimit: 999999999,
      monthlyLimit: 999999999,
      price: 64.99,
      features: ['API', 'Webhooks', 'sem limites'],
    },
  ];

  for (const plain of plains) {
    await prisma.plan
      .upsert({
        where: { name: plain.name },
        update: {},
        create: plain,
      })
      .then(() => logger.log(`Plain ${plain.name} created.`))
      .catch((e: Error) => {
        logger.error(`Error creating plain ${plain.name}.`);
        logger.error(e.message);
      });
  }

  logger.log('Plains created.');
}

async function createAdmin(logger: Logger) {
  logger.log('Creating admin...');

  const admin: User = {
    name: 'Admin',
    email: 'XXXXXXXXXXXXXX',
    password: 'XXXXX',
    id: 0,
    isActive: false,
    whatsapp: '+164879562356',
    apiKey: 'abc',
    webhookUrl: 'http://localhost:3002',
    retentionDays: 0,
    planId: 3,
  };

  await prisma.user
    .upsert({
      where: { email: admin.email },
      update: {},
      create: admin,
    })
    .then(() => logger.log('Admin created.'))
    .catch((e: Error) => {
      logger.error('Error creating admin.');
      logger.error(e.message);
    });
}

async function main() {
  const logger = new Logger('Seed');

  await createPlains(logger);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
