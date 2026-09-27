import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AttendanceService, OFFICE_COORDINATES } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      employee: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'emp-1',
          employeeNumber: 'NX-2026-0001',
          firstName: 'Budi',
          lastName: 'Santoso',
        }),
      },
      attendance: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      workShift: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'shift-1',
          code: 'REG-01',
          name: 'Regular',
          startTime: '09:00',
          endTime: '18:00',
          graceMinutes: 15,
        }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('clockIn', () => {
    it('should throw BadRequestException if GPS coordinates are outside office radius', async () => {
      // Coordinates far away in North Jakarta (approx 14 km away from SCBD)
      const farLatitude = -6.1200;
      const farLongitude = 106.8500;

      await expect(
        service.clockIn('user-1', {
          latitude: farLatitude,
          longitude: farLongitude,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully clock in when within office radius (<= 100m)', async () => {
      prismaService.attendance.findUnique.mockResolvedValue(null);
      prismaService.attendance.upsert.mockResolvedValue({
        id: 'att-1',
        date: new Date(),
        clockInTime: new Date(),
        status: 'PRESENT',
        lateMinutes: 0,
        shift: { name: 'Regular' },
      });

      const result = await service.clockIn('user-1', {
        latitude: OFFICE_COORDINATES.latitude,
        longitude: OFFICE_COORDINATES.longitude,
      });

      expect(result).toHaveProperty('attendance');
      expect(result.attendance.status).toBe('PRESENT');
    });

    it('should throw ConflictException if already clocked in today', async () => {
      prismaService.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        clockInTime: new Date(),
      });

      await expect(
        service.clockIn('user-1', {
          latitude: OFFICE_COORDINATES.latitude,
          longitude: OFFICE_COORDINATES.longitude,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('clockOut', () => {
    it('should throw BadRequestException if not clocked in today', async () => {
      prismaService.attendance.findUnique.mockResolvedValue(null);

      await expect(
        service.clockOut('user-1', {
          latitude: OFFICE_COORDINATES.latitude,
          longitude: OFFICE_COORDINATES.longitude,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
