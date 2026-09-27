import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class QueryPayrollDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan UUID Periode Penggajian',
  })
  @IsOptional()
  @IsUUID('4')
  periodId?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan Departemen',
  })
  @IsOptional()
  @IsUUID('4')
  departmentId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
