import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      userSession: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is temporarily locked', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'locked@test.com',
        lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes in future
      });

      await expect(
        service.login({ email: 'locked@test.com', password: 'password123' }),
      ).rejects.toThrow(/Akun terkunci sementara/);
    });

    it('should successfully login and return tokens when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'admin@nexora.local',
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        lockedUntil: null,
        userRoles: [
          {
            role: {
              name: 'HR_ADMIN',
              rolePermissions: [],
            },
          },
        ],
        employee: {
          id: 'emp-1',
          employeeNumber: 'NX-001',
          firstName: 'Admin',
          lastName: 'HR',
          department: { name: 'HRD' },
          designation: { title: 'Specialist' },
        },
      });

      prismaService.user.update.mockResolvedValue({});
      prismaService.userSession.create.mockResolvedValue({});

      const result = await service.login(
        { email: 'admin@nexora.local', password: 'secret123' },
        'TestBrowser',
        '127.0.0.1',
      );

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('admin@nexora.local');
    });
  });
});
