import { Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
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
    },
    {
      name: 'Básico',
      dailyLimit: 2500,
      monthlyLimit: 50000,
      price: 39.9,
    },
    {
      name: 'Premium',
      dailyLimit: 999999999,
      monthlyLimit: 999999999,
      price: 99.9,
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

  const admin: Prisma.UserCreateInput = {
    name: 'Admin',
    email: 'X@X.com',
    password: await hash('XXXXX', 12),
    isActive: false,
    whatsapp: '+164879562356',
    webhookUrl: 'http://localhost:3002',
    Plan: {
      connect: {
        name: 'Premium',
      },
    },
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

async function createEvents(logger: Logger) {
  logger.log('Creating events...');

  const events = [
    { slug: 'message.received', name: 'Mensagem Recebida', description: 'Quando uma mensagem é recebida' },
    { slug: 'message.sent', name: 'Mensagem Enviada', description: 'Quando uma mensagem é enviada' },
    { slug: 'message.delivered', name: 'Mensagem Entregue', description: 'Quando uma mensagem é entregue' },
    { slug: 'message.read', name: 'Mensagem Lida', description: 'Quando uma mensagem é lida' },
    { slug: 'session.connected', name: 'Sessão Conectada', description: 'Quando a sessão WhatsApp conecta' },
    { slug: 'session.disconnected', name: 'Sessão Desconectada', description: 'Quando a sessão WhatsApp desconecta' },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    });
  }

  logger.log('Events created.');
}

async function main() {
  const logger = new Logger('Seed');

  await createPlains(logger);
  await createEvents(logger);
  await createAdmin(logger);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
