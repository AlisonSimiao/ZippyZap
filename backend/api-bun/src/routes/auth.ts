import { Elysia, t } from 'elysia';
import { prisma } from '../services/prisma';
import { hash, compare } from 'bcrypt';
import { ConflictException, ForbiddenException } from '../types';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post(
    '/signup',
    async ({ body, jwt }) => {
      const { email, password, whatsapp, name } = body;

      // Check if user already exists
      const userExists = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { whatsapp }],
        },
        select: { email: true, whatsapp: true },
      });

      if (userExists) {
        const [prop, value] =
          userExists.email === email
            ? ['Email', email]
            : ['Whatsapp', whatsapp];
        throw new ConflictException(
          `Usuario com ${prop} '${value}' já existe`,
        );
      }

      const hashedPassword = await hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          whatsapp,
          password: hashedPassword,
          Plan: {
            connect: { name: 'Gratuito' },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          whatsapp: true,
        },
      });

      const token = await jwt.sign({ id: String(user.id) });

      return {
        token,
        user,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
        whatsapp: t.String(),
        name: t.Optional(t.String()),
      }),
    },
  )
  .post(
    '/signin',
    async ({ body, jwt }) => {
      const { email, password } = body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !(await compare(password, user.password))) {
        throw new ForbiddenException('Invalid credentials');
      }

      const { password: _, ...userWithoutPassword } = user;

      const token = await jwt.sign({ id: String(user.id) });

      return {
        token,
        user: userWithoutPassword,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
    },
  );
