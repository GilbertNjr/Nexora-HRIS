import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentType } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Budi' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional({ example: 'Santoso' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'budi.santoso@nexora.local' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+628123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'ID Perusahaan (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ description: 'ID Departemen (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ description: 'ID Jabatan (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  designationId: string;

  @ApiPropertyOptional({ description: 'ID Golongan Gaji (UUID)' })
  @IsOptional()
  @IsUUID()
  jobGradeId?: string;

  @ApiPropertyOptional({ description: 'ID Atasan Langsung / Manager (UUID)' })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({
    enum: EmploymentType,
    example: EmploymentType.PERMANENT,
    description: 'Tipe status kerja (PERMANENT, CONTRACT_PKWT, PROBATION, INTERNSHIP)',
  })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ example: '2026-09-01', description: 'Tanggal mulai bergabung (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  joinDate: string;

  // Rekening Bank
  @ApiPropertyOptional({ example: 'Bank Central Asia (BCA)' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  @IsString()
  accountHolder?: string;
}
