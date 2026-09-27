import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'super-secret-jwt-signing-key-min-64-characters-long-nexora-hris',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            designation: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Sesi tidak valid: Akun tidak ditemukan');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        `Akun berstatus ${user.status}: Akses tidak diizinkan`,
      );
    }

    const roles = user.userRoles.map((ur) => ur.role.name);

    return {
      id: user.id,
      email: user.email,
      roles,
      employee: user.employee,
    };
  }
}
