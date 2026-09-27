import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: Partial<PrismaService>;

  beforeEach(async () => {
    prismaService = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkLiveness', () => {
    it('should return UP status with uptime and timestamp', () => {
      const result = controller.checkLiveness();
      expect(result).toHaveProperty('status', 'UP');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service', 'nexora-api');
    });
  });

  describe('checkReadiness', () => {
    it('should return READY when database is connected', async () => {
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
      };

      const result = await controller.checkReadiness(mockRes);
      expect(result).toHaveProperty('status', 'READY');
      expect(result.dependencies.database).toBe('UP');
    });

    it('should return DEGRADED when database fails', async () => {
      (prismaService.$queryRaw as jest.Mock).mockRejectedValueOnce(
        new Error('DB Connection Refused'),
      );

      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
      };

      const result = await controller.checkReadiness(mockRes);
      expect(result).toHaveProperty('status', 'DEGRADED');
      expect(result.dependencies.database).toContain('DOWN');
      expect(mockRes.status).toHaveBeenCalledWith(503);
    });
  });
});
