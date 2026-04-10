import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEvents() {
  const events = [
    {
      name: 'Mensagem Recebida',
      slug: 'message.received',
      description: 'Disparado quando uma mensagem é recebida no WhatsApp',
    },
    {
      name: 'Mensagem Enviada',
      slug: 'message.sent',
      description: 'Disparado quando uma mensagem é enviada com sucesso',
    },
    {
      name: 'Mensagem Entregue',
      slug: 'message.delivered',
      description: 'Disparado quando uma mensagem é entregue ao destinatário',
    },
    {
      name: 'Mensagem Lida',
      slug: 'message.read',
      description: 'Disparado quando uma mensagem é lida pelo destinatário',
    },
    {
      name: 'Status da Conexão',
      slug: 'connection.status',
      description: 'Disparado quando o status da conexão WhatsApp muda',
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }

  console.log('Events seeded successfully');
}

seedEvents()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });