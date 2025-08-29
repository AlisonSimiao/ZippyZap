import { Logger } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function createPlains(logger: Logger) {
  logger.log('Creating plains...');

  const plains = [
    {
      name: 'Gratuito',
      dailyLimit: 50,
      monthlyLimit: 1500,
      price: 0,
      features: ['API'],
    },
    {
      name: 'Básico',
      dailyLimit: 2500,
      monthlyLimit: 50000,
      price: 39.9,
      features: ['API', 'Webhooks'],
    },
    {
      name: 'Premium',
      dailyLimit: 999999999,
      monthlyLimit: 999999999,
      price: 99.9,
      features: ['API', 'Webhooks', 'Ilimitado'],
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
    email: 'X@X.com',
    password: await hash('XXXXX', 12),
    id: 1,
    isActive: false,
    whatsapp: '+164879562356',
    webhookUrl: 'http://localhost:3002',
    retentionDays: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
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
  await createAdmin(logger);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
