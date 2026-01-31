import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
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

    const { password, ...newUser } = user;

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

    const user = await this.prisma.user.create({
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
        email: true,
        name: true,
        whatsapp: true,
      },
    });

    // Retornar token JWT para auto-login após signup
    return {
      token: this.jwtService.sign({ id: user.id }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        whatsapp: user.whatsapp,
      },
    };
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

    let qrBase64: string;
    try {
      const parsed = JSON.parse(qrData);
      qrBase64 = parsed.qr;
    } catch (error) {
      qrBase64 = qrData;
    }

    const status = (await this.redisService.get(`user:${idUser}:status`)) || '';

    return {
      status,
      qr: qrBase64,
    };
  }

  async createWhatsAppSession(idUser: string, apiKeyHash?: string) {
    const userId = parseInt(idUser, 10);
    if (isNaN(userId) || userId <= 0) {
      throw new BadRequestException('ID de usuário inválido');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    const currentStatus = await this.redisService.get(`user:${idUser}:status`);

    if (currentStatus && currentStatus !== 'disconnected') {
      if (user.Plan.sessionLimit === 1) {
        throw new ConflictException(
          `Limite de sessões atingido. Seu plano "${user.Plan.name}" permite apenas ${user.Plan.sessionLimit} sessão ativa. Status atual: ${currentStatus}`,
        );
      }
    }

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
    // Validar formato de URL
    let url: URL;
    try {
      url = new URL(webhookUrl);
    } catch {
      throw new BadRequestException('URL inválida');
    }

    // Bloquear protocolos perigosos
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new BadRequestException('Apenas HTTP/HTTPS permitidos');
    }

    // Bloquear IPs privados
    const hostname = url.hostname;
    const privateIpRegex =
      /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|localhost|0\.0\.0\.0)/;
    if (privateIpRegex.test(hostname)) {
      throw new BadRequestException('URLs internas não permitidas');
    }

    // Adicionar timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
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
        signal: controller.signal,
      });

      if (!res.ok || res.status !== 200) {
        throw new ForbiddenException('Webhook URL não respondeu corretamente');
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  async getStatus(idUser: string): Promise<{ status: string }> {
    const status =
      (await this.redisService.get(`user:${idUser}:status`)) || 'disconnected';
    return { status };
  }

  async logout(idUser: string) {
    const status = await this.redisService.get(`user:${idUser}:status`);
    if (!status && !(await this.redisService.get(`user:${idUser}:qrcode`))) {
      return { success: true, message: 'Already disconnected' };
    }

    await this.redisService.delete(`user:${idUser}:status`);
    await this.redisService.delete(`user:${idUser}:qrcode`);
    await this.redisService.delete(`user:${idUser}:apikey`);

    return { success: true, message: 'Logout completed' };
  }
}
