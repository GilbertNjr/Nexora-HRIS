import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      employee: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'emp-1',
            employeeNumber: 'NX-2026-0001',
            firstName: 'Budi',
            lastName: 'Santoso',
            phone: '+628123456789',
            departmentId: 'dept-1',
            designationId: 'desig-1',
            employmentType: 'PERMANENT',
            employmentStatus: 'ACTIVE',
            joinDate: new Date('2024-01-01'),
            createdAt: new Date(),
            user: { email: 'budi@nexora.local' },
            department: { id: 'dept-1', name: 'HRD', code: 'HRD' },
            designation: { id: 'desig-1', title: 'HR Officer', code: 'HRO' },
            jobGrade: { level: 3, name: 'Senior Staff' },
            manager: null,
          },
        ]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      department: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated list of employees with meta', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('meta');
      expect(result.items.length).toBe(1);
      expect(result.items[0].employeeNumber).toBe('NX-2026-0001');
      expect(result.items[0].fullName).toBe('Budi Santoso');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return employee detail with masked bank account', async () => {
      prismaService.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        employeeNumber: 'NX-2026-0001',
        firstName: 'Budi',
        lastName: 'Santoso',
        employmentType: 'PERMANENT',
        employmentStatus: 'ACTIVE',
        joinDate: new Date('2024-01-01'),
        createdAt: new Date(),
        bankAccount: {
          bankName: 'BCA',
          accountNumberEnc: 'invalid_enc:1234567890',
          accountHolderEnc: 'invalid_enc:Budi',
        },
      });

      const result = await service.findById('emp-1');
      expect(result.id).toBe('emp-1');
      expect(result.employeeNumber).toBe('NX-2026-0001');
      expect(result.bankAccount).toBeDefined();
      expect(result.bankAccount?.bankName).toBe('BCA');
    });
  });
});
