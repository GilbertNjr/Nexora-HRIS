import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalStatus, LeaveStatus } from '../../common/enums';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LeaveService } from './leave.service';

describe('LeaveService', () => {
  let service: LeaveService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      employee: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'emp-1',
          employeeNumber: 'NX-2026-0001',
          firstName: 'Budi',
          lastName: 'Santoso',
          managerId: 'emp-mgr-1',
        }),
        findFirst: jest.fn().mockResolvedValue({
          id: 'emp-hr-1',
          firstName: 'HR',
          lastName: 'Admin',
        }),
      },
      leaveType: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'type-annual') {
            return Promise.resolve({
              id: 'type-annual',
              code: 'ANNUAL',
              name: 'Cuti Tahunan',
              requiresDocument: false,
            });
          }
          if (where.id === 'type-sick') {
            return Promise.resolve({
              id: 'type-sick',
              code: 'SICK',
              name: 'Cuti Sakit',
              requiresDocument: true,
            });
          }
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      leaveBalance: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'balance-1',
          totalDays: 12,
          usedDays: 2,
          pendingDays: 0,
        }),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
      },
      leaveRequest: {
        create: jest.fn().mockResolvedValue({
          id: 'req-1',
          employeeId: 'emp-1',
          leaveTypeId: 'type-annual',
          startDate: new Date('2026-10-01'),
          endDate: new Date('2026-10-02'),
          totalDays: 2,
          status: LeaveStatus.PENDING,
        }),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      leaveApproval: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      attendance: {
        upsert: jest.fn().mockResolvedValue({}),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-mgr-1',
          userRoles: [{ role: { name: 'LINE_MANAGER' } }],
        }),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRequest', () => {
    it('should throw BadRequestException if endDate is earlier than startDate', async () => {
      await expect(
        service.createRequest('user-1', {
          leaveTypeId: 'type-annual',
          startDate: '2026-10-05',
          endDate: '2026-10-02',
          totalDays: 2,
          reason: 'Liburan keluarga',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if sick leave requires document but none provided [REQ-DEC-06]', async () => {
      await expect(
        service.createRequest('user-1', {
          leaveTypeId: 'type-sick',
          startDate: '2026-09-27',
          endDate: '2026-09-27',
          totalDays: 1,
          reason: 'Flu berat',
          documentUrl: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if backdated sick leave exceeds H+2 tolerance [REQ-DEC-06]', async () => {
      // 5 days ago
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const dateStr = fiveDaysAgo.toISOString().split('T')[0];

      await expect(
        service.createRequest('user-1', {
          leaveTypeId: 'type-sick',
          startDate: dateStr,
          endDate: dateStr,
          totalDays: 1,
          reason: 'Rawat inap minggu lalu',
          documentUrl: 'https://example.com/surat-dokter.pdf',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully submit annual leave request within balance quota', async () => {
      const result = await service.createRequest('user-1', {
        leaveTypeId: 'type-annual',
        startDate: '2026-10-10',
        endDate: '2026-10-11',
        totalDays: 2,
        reason: 'Urusan keluarga',
      });

      expect(result).toHaveProperty('leaveRequest');
      expect(prismaService.leaveRequest.create).toHaveBeenCalled();
      expect(prismaService.leaveBalance.update).toHaveBeenCalled();
      expect(prismaService.leaveApproval.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if requested days exceed available quota', async () => {
      prismaService.leaveBalance.findUnique.mockResolvedValueOnce({
        id: 'balance-1',
        totalDays: 12,
        usedDays: 11,
        pendingDays: 0,
      });

      await expect(
        service.createRequest('user-1', {
          leaveTypeId: 'type-annual',
          startDate: '2026-10-10',
          endDate: '2026-10-12',
          totalDays: 3,
          reason: 'Mudik',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelRequest', () => {
    it('should revert pending balance and mark leave request as CANCELLED', async () => {
      prismaService.leaveRequest.findUnique.mockResolvedValueOnce({
        id: 'req-1',
        employeeId: 'emp-1',
        leaveTypeId: 'type-annual',
        totalDays: 2,
        startDate: new Date('2026-10-01'),
        status: LeaveStatus.PENDING,
      });

      const res = await service.cancelRequest('user-1', 'req-1');

      expect(res.message).toContain('berhasil dibatalkan');
      expect(prismaService.leaveRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: LeaveStatus.CANCELLED },
        }),
      );
    });

    it('should throw ConflictException if trying to cancel an already APPROVED request', async () => {
      prismaService.leaveRequest.findUnique.mockResolvedValueOnce({
        id: 'req-1',
        employeeId: 'emp-1',
        leaveTypeId: 'type-annual',
        totalDays: 2,
        startDate: new Date('2026-10-01'),
        status: LeaveStatus.APPROVED,
      });

      await expect(service.cancelRequest('user-1', 'req-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('actionApproval', () => {
    it('should successfully approve leave request and update attendance to ON_LEAVE on final approval', async () => {
      prismaService.leaveApproval.findUnique.mockResolvedValueOnce({
        id: 'app-1',
        approverId: 'emp-1',
        level: 1,
        status: ApprovalStatus.PENDING,
        request: {
          id: 'req-1',
          employeeId: 'emp-2',
          leaveTypeId: 'type-annual',
          startDate: new Date('2026-10-01'),
          totalDays: 2,
          reason: 'Cuti istirahat',
          leaveType: { code: 'ANNUAL', name: 'Cuti Tahunan' },
          employee: { firstName: 'Siti', lastName: 'Aisyah' },
        },
      });

      const res = await service.actionApproval('user-mgr-1', 'app-1', {
        status: ApprovalStatus.APPROVED,
        notes: 'Disetujui, selamat berlibur',
      });

      expect(res.message).toContain('disetujui');
      expect(prismaService.attendance.upsert).toHaveBeenCalled();
    });
  });
});
