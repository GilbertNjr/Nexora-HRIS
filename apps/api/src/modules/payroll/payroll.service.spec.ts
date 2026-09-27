import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollStatus } from '../../common/enums';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  calculateBpjs,
  calculateOvertimePay,
  calculatePph21Ter,
  calculateProratedSalary,
  determineTerCategory,
} from './engine/pph21-ter.calculator';
import { PayrollService } from './payroll.service';

describe('Payroll Engine & Service', () => {
  let service: PayrollService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      payrollPeriod: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      employeeSalaryStructure: {
        upsert: jest.fn(),
      },
      payrollRecord: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: 'rec-1' }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      payrollItem: {
        create: jest.fn().mockResolvedValue({}),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  describe('PPh 21 TER Engine (PP 58/2023 & PMK 168/2023)', () => {
    it('should determine correct TER category from PTKP status', () => {
      expect(determineTerCategory('TK/0')).toBe('TER_A');
      expect(determineTerCategory('K/0')).toBe('TER_A');
      expect(determineTerCategory('K/1')).toBe('TER_B');
      expect(determineTerCategory('TK/2')).toBe('TER_B');
      expect(determineTerCategory('K/3')).toBe('TER_C');
    });

    it('should return 0% tax for monthly gross under PTKP limit (<= 5.4 jt on TER A)', () => {
      const res = calculatePph21Ter(5000000, 'TER_A');
      expect(res.rate).toBe(0);
      expect(res.taxAmount).toBe(0);
    });

    it('should calculate accurate PPh 21 TER for 10 jt gross (TER A: 2.0%)', () => {
      const res = calculatePph21Ter(10000000, 'TER_A');
      expect(res.rate).toBe(0.02);
      expect(res.taxAmount).toBe(200000);
    });

    it('should calculate accurate PPh 21 TER for 12 jt gross (TER A: 3.0%)', () => {
      const res = calculatePph21Ter(12000000, 'TER_A');
      expect(res.rate).toBe(0.03);
      expect(res.taxAmount).toBe(360000);
    });
  });

  describe('BPJS Calculation Engine', () => {
    it('should calculate BPJS TK & Kes deductions accurately for Rp 10.000.000 salary', () => {
      const bpjs = calculateBpjs(10000000);
      // JHT Emp: 2% of 10.000.000 = 200.000
      expect(bpjs.employeeDeductions.jht).toBe(200000);
      // JP Emp: 1% of 10.000.000 = 100.000
      expect(bpjs.employeeDeductions.jp).toBe(100000);
      // Kes Emp: 1% of 10.000.000 = 100.000
      expect(bpjs.employeeDeductions.bpjsKes).toBe(100000);
      // Total Employee Deduction: 400.000
      expect(bpjs.employeeDeductions.totalAll).toBe(400000);
    });

    it('should cap BPJS Kes employee deduction at Rp 12.000.000 wage ceiling', () => {
      const bpjsHigh = calculateBpjs(25000000);
      // 1% of 12.000.000 max = 120.000
      expect(bpjsHigh.employeeDeductions.bpjsKes).toBe(120000);
    });
  });

  describe('Overtime Pay Engine (PP 35/2021) [REQ-DEC-05]', () => {
    it('should calculate Depnaker overtime pay correctly (1.5x hour 1, 2.0x hour 2+)', () => {
      // Base salary 17.300.000 -> hourly wage = 100.000
      const baseSalary = 17300000;
      // 1 hour: 1.5 * 100.000 = 150.000
      expect(calculateOvertimePay(baseSalary, 1)).toBe(150000);
      // 2 hours: 150.000 + 200.000 = 350.000
      expect(calculateOvertimePay(baseSalary, 2)).toBe(350000);
    });
  });

  describe('Mid-Month Prorate Engine [REQ-DEC-08]', () => {
    it('should calculate prorated salary based on real calendar working days', () => {
      const base = 10000000;
      // 11 out of 22 working days = 5.000.000
      expect(calculateProratedSalary(base, 11, 22)).toBe(5000000);
      // 22 out of 22 working days = full 10.000.000
      expect(calculateProratedSalary(base, 22, 22)).toBe(10000000);
    });
  });

  describe('PayrollService Business Logic', () => {
    it('should throw ConflictException when creating period with duplicate code', async () => {
      prismaService.payrollPeriod.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        code: '2026-10',
      });

      await expect(
        service.createPeriod({
          code: '2026-10',
          name: 'Oktober 2026',
          startDate: '2026-10-01',
          endDate: '2026-10-31',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if trying to calculate a LOCKED period [REQ-DEC-09]', async () => {
      prismaService.payrollPeriod.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        name: 'September 2026',
        status: PayrollStatus.LOCKED,
      });

      await expect(
        service.calculatePeriod('p-1', 'admin-user-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully run batch calculation for active employees and update period to VERIFIED', async () => {
      prismaService.payrollPeriod.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        name: 'Oktober 2026',
        code: '2026-10',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-31'),
        status: PayrollStatus.DRAFT,
      });

      prismaService.employee.findMany.mockResolvedValueOnce([
        {
          id: 'emp-1',
          employeeNumber: 'NX-2026-0001',
          firstName: 'Budi',
          lastName: 'Santoso',
          joinDate: new Date('2025-01-01'),
          department: { name: 'Technology', code: 'TECH' },
          designation: { title: 'Senior Engineer' },
          bankAccount: { bankName: 'BCA' },
          salaryStructure: {
            baseSalary: 10000000,
            allowances: [{ code: 'MEAL', name: 'Uang Makan', amount: 500000 }],
            deductions: [],
          },
          attendances: [],
        },
      ]);

      const result = await service.calculatePeriod('p-1', 'admin-user-id');

      expect(result.processedEmployees).toBe(1);
      expect(prismaService.payrollRecord.create).toHaveBeenCalled();
      expect(prismaService.payrollPeriod.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PayrollStatus.VERIFIED,
          }),
        }),
      );
    });

    it('should lock period and make it immutable [REQ-DEC-09]', async () => {
      prismaService.payrollPeriod.findUnique.mockResolvedValueOnce({
        id: 'p-1',
        name: 'Oktober 2026',
        status: PayrollStatus.VERIFIED,
      });

      prismaService.payrollPeriod.update.mockResolvedValueOnce({
        id: 'p-1',
        status: PayrollStatus.LOCKED,
      });

      const res = await service.lockPeriod('p-1', 'admin-user-id');
      expect(res.message).toContain('LOCKED');
      expect(prismaService.payrollPeriod.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: PayrollStatus.LOCKED }),
        }),
      );
    });
  });
});
