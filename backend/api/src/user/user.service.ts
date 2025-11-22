import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { Queue } from 'bullmq';
import { LoginhDto, ResponseLogin } from 'src/auth/dto/login-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @InjectQueue('create-user') private queue: Queue,
    private redisService: RedisService,
  ) { }

  async login(body: LoginhDto): Promise<ResponseLogin> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !(await compare(body.password, user.password))) {
      throw new ForbiddenException('Invalid credentials');
    }

    const newUser = { ...user, password: undefined };

    return {
      token: this.jwtService.sign({ id: user.id }),
      user: newUser,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword: string = await hash(createUserDto.password, 10);

    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: createUserDto.email,
          },
          {
            whatsapp: createUserDto.whatsapp,
          },
        ],
      },
      select: {
        email: true,
        whatsapp: true,
      },
    });

    if (userExists) {
      const [prop, value] =
        userExists.email === createUserDto.email
          ? ['Email', createUserDto.email]
          : ['Whatsapp', createUserDto.whatsapp];

      throw new ConflictException(`Usuario com ${prop} '${value}' já existe`);
    }

    await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        whatsapp: createUserDto.whatsapp,
        password: hashedPassword,
        Plan: {
          connect: {
            name: 'Gratuito',
          },
        },
      },
      select: {
        id: true,
        whatsapp: true,
      },
    });
  }

  async getWhatsAppQRCode(idUser: string): Promise<{ status: string; qr: string }> {
    const qr = await this.redisService.get(`user:${idUser}:qrcode`);

    if (!qr) {
      throw new NotFoundException(
        'QR code not found',
        'tenha certeza que já usou a rota de criar sessao',
      );
    }

    const status = await this.redisService.get(`user:${idUser}:status`) || '';

    return {
      status,
      qr
    };
  }

  async createWhatsAppSession(idUser: string) {
    await this.queue.add('create-user', {
      idUser,
    });

    return {
      "success": true,
      "sessionId": `session_${idUser}`,
      "status": "initializing",
      "message": "Sessão criada. Use /qrcode para obter o QR Code"
    }
  }

  async update(body: UpdateUserDto, idUser: number) {
    await this.testWebhookUrl(body.webhookUrl);

    await this.prisma.user.update({
      where: {
        id: idUser,
      },
      data: {
        name: body.name,
        email: body.email,
        whatsapp: body.whatsapp,
        webhookUrl: body.webhookUrl,
        retentionDays: body.retentionDays,
      },
    });
  }

  async testWebhookUrl(webhookUrl: string) {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'TESTE',
        payload: {
          message: 'teste',
        },
      }),
    });

    if (!res.ok || res.status !== 200)
      throw new ForbiddenException('Webhook URL não tem uma resposta valida');
  }
}
