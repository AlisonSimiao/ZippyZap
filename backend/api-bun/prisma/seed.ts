import { Prisma, PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function createPlans() {
  console.log('Creating plans...');

  const plans = [
    {
      name: 'Gratuito',
      dailyLimit: 50,
      monthlyLimit: 1500,
      sessionLimit: 1,
      price: 0,
    },
    {
      name: 'Básico',
      dailyLimit: 2500,
      monthlyLimit: 50000,
      sessionLimit: 1,
      price: 39.9,
    },
    {
      name: 'Premium',
      dailyLimit: 999999999,
      monthlyLimit: 999999999,
      sessionLimit: 1,
      price: 99.9,
    },
  ];

  for (const plan of plans) {
    try {
      await prisma.plan.upsert({
        where: { name: plan.name },
        update: {},
        create: plan,
      });
      console.log(`Plan ${plan.name} created.`);
    } catch (e) {
      console.error(`Error creating plan ${plan.name}:`, e);
    }
  }

  console.log('Plans created.');
}

async function createAdmin() {
  console.log('Creating admin...');

  const admin: Prisma.UserCreateInput = {
    name: 'Admin',
    email: 'admin@zapi.com',
    password: await hash('admin123', 12),
    isActive: true,
    whatsapp: '+5511999999999',
    webhookUrl: 'http://localhost:3000/webhook',
    Plan: {
      connect: {
        name: 'Premium',
      },
    },
    retentionDays: 30,
  };

  try {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: admin,
    });
    console.log('Admin created.');
  } catch (e) {
    console.error('Error creating admin:', e);
  }
}

async function createEvents() {
  console.log('Creating events...');

  const events = [
    { slug: 'message.received', name: 'Mensagem Recebida', description: 'Quando uma mensagem é recebida' },
    { slug: 'message.sent', name: 'Mensagem Enviada', description: 'Quando uma mensagem é enviada' },
    { slug: 'message.delivered', name: 'Mensagem Entregue', description: 'Quando uma mensagem é entregue' },
    { slug: 'message.read', name: 'Mensagem Lida', description: 'Quando uma mensagem é lida' },
    { slug: 'session.connected', name: 'Sessão Conectada', description: 'Quando a sessão WhatsApp conecta' },
    { slug: 'session.disconnected', name: 'Sessão Desconectada', description: 'Quando a sessão WhatsApp desconecta' },
  ];

  for (const event of events) {
    try {
      await prisma.event.upsert({
        where: { slug: event.slug },
        update: {},
        create: event,
      });
    } catch (e) {
      console.error(`Error creating event ${event.slug}:`, e);
    }
  }

  console.log('Events created.');
}

async function main() {
  console.log('Starting seed...');

  await createPlans();
  await createEvents();
  await createAdmin();

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });