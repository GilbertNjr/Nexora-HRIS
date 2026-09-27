import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'log-1',
            action: 'LOGIN_SUCCESS',
            module: 'AUTH',
            recordId: 'user-1',
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            oldData: null,
            newData: { email: 'admin@nexora.local' },
            createdAt: new Date(),
            user: {
              id: 'user-1',
              email: 'admin@nexora.local',
              employee: {
                firstName: 'Super',
                lastName: 'Admin',
                employeeNumber: 'NX-2026-0000',
              },
            },
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
        groupBy: jest.fn().mockResolvedValue([
          { module: 'AUTH', _count: { _all: 10 } },
          { module: 'PAYROLL', _count: { _all: 5 } },
        ]),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLogs', () => {
    it('should return paginated audit logs', async () => {
      const res = await service.getLogs({ page: 1, limit: 10 });
      expect(res.data.length).toBe(1);
      expect(res.data[0].action).toBe('LOGIN_SUCCESS');
      expect(res.data[0].user?.name).toBe('Super Admin');
      expect(res.meta.total).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return audit statistics and ISO 27001 append-only compliance flag', async () => {
      const stats = await service.getStats();
      expect(stats.complianceStatus).toBe('ISO_27001_COMPLIANT');
      expect(stats.tamperProofMode).toBe('APPEND_ONLY');
      expect(stats.moduleBreakdown).toHaveProperty('AUTH');
    });
  });

  describe('getLogById', () => {
    it('should throw NotFoundException if log not found', async () => {
      prismaService.auditLog.findUnique.mockResolvedValueOnce(null);
      await expect(service.getLogById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
