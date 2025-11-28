import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async use(
    req: Request & { user: Record<string, any> },
    res: Response,
    next: () => void,
  ) {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string;

      if (!token) throw new ForbiddenException('Token not found');

      const payload = this.jwtService.verify<{ id: number }>(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.id,
        },
        select: {
          id: true,
        },
      });

      if (!user) throw new UnauthorizedException('User not found');

      (req as { user: Record<string, any> }).user = user;
      console.log(req.originalUrl);
      next();
    } catch (err) {
      console.log(err.message);
      throw new UnauthorizedException();
    }
  }
}
