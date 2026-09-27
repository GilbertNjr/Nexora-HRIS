import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Login user dengan validasi proteksi brute force & Single Active Session untuk ESS
   */
  async login(
    dto: LoginDto,
    userAgent: string = 'Unknown Agent',
    ipAddress: string = '127.0.0.1',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    // 1. Cek apakah akun sedang terkunci (Brute Force Protection)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (1000 * 60),
      );
      throw new UnauthorizedException(
        `Akun terkunci sementara demi keamanan karena 5x percobaan gagal. Silakan coba kembali dalam ${remainingMinutes} menit.`,
      );
    }

    // 2. Verifikasi Password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      // Kunci akun selama 15 menit jika gagal 5 kali berturut-turut
      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      throw new UnauthorizedException(
        failedAttempts >= 5
          ? 'Akun telah dikunci selama 15 menit karena terlalu banyak percobaan gagal.'
          : `Kredensial login tidak valid. Sisa percobaan: ${5 - failedAttempts}`,
      );
    }

    // 3. Reset failed login counters jika berhasil
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // 4. Kumpulkan Roles & Permissions
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    );

    // 5. Enforce Single Active Session untuk ESS (sesuai ADR-006 / [REQ-DEC-01])
    const isOnlyEmployee = roles.length === 1 && roles[0] === 'EMPLOYEE';
    if (isOnlyEmployee) {
      // Cabut seluruh sesi lama yang masih aktif
      await this.prisma.userSession.updateMany({
        where: {
          userId: user.id,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });
    }

    // 6. Generate Tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = this.hashToken(rawRefreshToken);

    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
    );

    // Simpan session baru di database
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Catat log audit login
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          module: 'AUTH',
          action: 'LOGIN_SUCCESS',
          ipAddress,
          userAgent,
          newData: { roles },
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to write audit log: ${(e as Error).message}`);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        roles,
        permissions,
        employee: user.employee
          ? {
              id: user.employee.id,
              employeeNumber: user.employee.employeeNumber,
              fullName: `${user.employee.firstName} ${user.employee.lastName || ''}`.trim(),
              department: user.employee.department?.name,
              designation: user.employee.designation?.title,
            }
          : null,
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
        expiresIn: 900, // 15 menit
        tokenType: 'Bearer',
      },
    };
  }

  /**
   * Rotasi Refresh Token untuk memperpanjang sesi tanpa login ulang
   */
  async refreshTokens(
    dto: RefreshTokenDto,
    userAgent: string = 'Unknown Agent',
    ipAddress: string = '127.0.0.1',
  ) {
    const hashed = this.hashToken(dto.refreshToken);

    const session = await this.prisma.userSession.findUnique({
      where: { refreshTokenHash: hashed },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.',
      );
    }

    // Cabut session lama (Token Rotation)
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    const user = session.user;
    if (user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    );

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = this.hashToken(newRawRefreshToken);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: newRefreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
    };
  }

  /**
   * Logout dan pencabutan sesi
   */
  async logout(userId: string, refreshToken?: string, ipAddress: string = '127.0.0.1') {
    if (refreshToken) {
      const hashed = this.hashToken(refreshToken);
      await this.prisma.userSession.updateMany({
        where: { userId, refreshTokenHash: hashed },
        data: { isRevoked: true },
      });
    } else {
      await this.prisma.userSession.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          module: 'AUTH',
          action: 'LOGOUT',
          ipAddress,
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to log logout audit: ${(e as Error).message}`);
    }

    return { message: 'Sesi berhasil diakhiri' };
  }

  /**
   * Profil pengguna yang sedang login
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        employee: {
          include: {
            company: true,
            department: true,
            designation: true,
            jobGrade: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    );

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      roles,
      permissions,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeNumber: user.employee.employeeNumber,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            fullName: `${user.employee.firstName} ${user.employee.lastName || ''}`.trim(),
            company: user.employee.company.name,
            department: user.employee.department.name,
            designation: user.employee.designation.title,
            jobGrade: user.employee.jobGrade?.name,
            employmentType: user.employee.employmentType,
            employmentStatus: user.employee.employmentStatus,
            joinDate: user.employee.joinDate,
            phone: user.employee.phone,
          }
        : null,
    };
  }

  /**
   * Pendaftaran user baru (Internal provisioning / initial seed)
   */
  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Alamat email sudah terdaftar');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const roleName = dto.roleName || 'EMPLOYEE';
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new BadRequestException(`Role '${roleName}' tidak ditemukan`);
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        userRoles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.role.name),
      createdAt: user.createdAt,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
