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
  ) {}

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

  async getWhatsAppQRCode(
    idUser: string,
  ): Promise<{ status: string; qr: string }> {
    const qrData = await this.redisService.get(`user:${idUser}:qrcode`);
    if (!qrData) {
      throw new NotFoundException(
        'QR code not found',
        'tenha certeza que já usou a rota de criar sessao',
      );
    }

    // Parse the JSON string to extract the base64 QR code
    let qrBase64: string;
    try {
      const parsed = JSON.parse(qrData);
      qrBase64 = parsed.qr;
    } catch (error) {
      // If it's not JSON, assume it's already the base64 string (backward compatibility)
      qrBase64 = qrData;
    }

    const status = (await this.redisService.get(`user:${idUser}:status`)) || '';

    return {
      status,
      qr: qrBase64,
    };
  }

  async createWhatsAppSession(idUser: string, apiKeyHash?: string) {
    // Buscar o usuário e seu plano para verificar o limite de sessões
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(idUser) },
      include: {
        Plan: {
          select: {
            name: true,
            sessionLimit: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se já existe uma sessão ativa
    const currentStatus = await this.redisService.get(`user:${idUser}:status`);

    if (currentStatus && currentStatus !== 'disconnected') {
      // Se o limite de sessões é 1 e já existe uma sessão ativa
      if (user.Plan.sessionLimit === 1) {
        throw new ConflictException(
          `Limite de sessões atingido. Seu plano "${user.Plan.name}" permite apenas ${user.Plan.sessionLimit} sessão ativa. Status atual: ${currentStatus}`,
        );
      }
    }

    // Store API key hash in Redis if provided
    if (apiKeyHash) {
      await this.redisService.set(`user:${idUser}:apikey`, apiKeyHash);
    }

    await this.queue.add('create-user', {
      idUser,
      apiKeyHash,
    });

    return {
      success: true,
      sessionId: `session_${idUser}`,
      status: 'initializing',
      message: 'Sessão criada. Use /qrcode para obter o QR Code',
    };
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

  async getStatus(idUser: string): Promise<{ status: string }> {
    const status =
      (await this.redisService.get(`user:${idUser}:status`)) || 'disconnected';
    return { status };
  }

  async logout(idUser: string) {
    // Check if session exists
    const status = await this.redisService.get(`user:${idUser}:status`);
    if (!status && !(await this.redisService.get(`user:${idUser}:qrcode`))) {
      // If no status and no QR code, consider already disconnected
      return { success: true, message: 'Already disconnected' };
    }

    // Clear session data from Redis
    await this.redisService.delete(`user:${idUser}:status`);
    await this.redisService.delete(`user:${idUser}:qrcode`);
    await this.redisService.delete(`user:${idUser}:apikey`);

    return { success: true, message: 'Logout completed' };
  }
}
