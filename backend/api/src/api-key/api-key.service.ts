import { ConflictException, Injectable } from '@nestjs/common';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  generateToken(prefix = 'key') {
    return prefix.concat(randomBytes(24).toString('base64'));
  }

  encript(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  paginate() {
    return this.prisma.apiKey.findMany({
      select: {
        id: true,
        status: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async createApiKey(body: CreateApiKeyDto, userId: number) {
    const token = this.generateToken();
    const encriptedToken = this.encript(token);

    const apikey =
      body.name &&
      (await this.prisma.apiKey.findFirst({
        where: { name: body.name, userId },
      }));

    if (apikey)
      throw new ConflictException(`Api key com nome '${body.name}' ja existe`);

    await this.prisma.apiKey.create({
      data: {
        name: body.name || randomBytes(5).toString('base64'),
        hash: encriptedToken,
        status: body.status,
        userId: userId,
      },
    });

    return {
      token,
    };
  }
}
