import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryAuditLogDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan modul (AUTH, EMPLOYEE, ATTENDANCE, LEAVE, PAYROLL)',
    example: 'AUTH',
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan aksi (LOGIN_SUCCESS, EMPLOYEE_CREATED, etc.)',
    example: 'LOGIN_SUCCESS',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter dari tanggal awal (YYYY-MM-DD)',
    example: '2026-09-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter hingga tanggal akhir (YYYY-MM-DD)',
    example: '2026-09-30',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 15, default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 15;
}
