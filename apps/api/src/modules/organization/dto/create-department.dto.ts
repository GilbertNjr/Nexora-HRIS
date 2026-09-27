import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'HRD', description: 'Kode unik departemen' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Human Resource Department' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'ID Perusahaan', example: 'uuid-company-id' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiPropertyOptional({ description: 'ID Departemen Induk (Hierarchy)', example: null })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
