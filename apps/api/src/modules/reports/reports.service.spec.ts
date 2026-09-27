import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      employee: {
        count: jest.fn().mockResolvedValue(10),
      },
      department: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'dept-1',
            code: 'TECH',
            name: 'Technology',
            _count: { employees: 6 },
          },
        ]),
      },
      attendance: {
        count: jest.fn().mockImplementation(({ where }) => {
          if (where?.lateMinutes) return Promise.resolve(2);
          if (where?.status === 'ON_LEAVE') return Promise.resolve(1);
          return Promise.resolve(20);
        }),
      },
      payrollPeriod: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'per-1',
          code: '2026-09',
          name: 'September 2026',
          status: 'PUBLISHED',
          totalGross: 60000000,
          totalNet: 55000000,
          _count: { records: 4 },
          records: [
            {
              id: 'rec-1',
              totalEarnings: 15000000,
              pph21Amount: 900000,
              snapshotData: { ptkpCategory: 'TER_A' },
            },
            {
              id: 'rec-2',
              totalEarnings: 12000000,
              pph21Amount: 480000,
              snapshotData: { ptkpCategory: 'TER_B' },
            },
          ],
        }),
      },
      leaveApproval: {
        count: jest.fn().mockResolvedValue(2),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExecutiveDashboard', () => {
    it('should aggregate headcount, attendance on-time rate, and payroll expenditure', async () => {
      const res = await service.getExecutiveDashboard();
      expect(res.overview.totalHeadcount).toBe(10);
      expect(res.overview.onTimeAttendanceRate).toBe('90%');
      expect(res.payrollExpenditure?.periodCode).toBe('2026-09');
      expect(res.departmentDistribution.length).toBe(1);
    });
  });

  describe('getTaxRecap', () => {
    it('should aggregate PPh 21 TER distribution by category', async () => {
      const res = await service.getTaxRecap('per-1');
      expect(res.period?.code).toBe('2026-09');
      expect(res.summary.totalGross).toBe(27000000);
      expect(res.summary.totalPph21).toBe(1380000);
      expect(res.breakdownByTerCategory.length).toBe(3);
    });
  });
});
