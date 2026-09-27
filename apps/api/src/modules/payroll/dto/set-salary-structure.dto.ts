import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class SalaryAllowanceItemDto {
  @ApiProperty({ example: 'TRANSPORT', description: 'Kode komponen' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Tunjangan Transportasi', description: 'Nama tunjangan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1000000, description: 'Nominal tunjangan' })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class SalaryDeductionItemDto {
  @ApiProperty({ example: 'LOAN', description: 'Kode potongan' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Cicilan Koperasi Karyawan', description: 'Nama potongan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 500000, description: 'Nominal potongan' })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class SetSalaryStructureDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID Karyawan',
  })
  @IsNotEmpty({ message: 'Employee ID wajib diisi.' })
  @IsUUID('4', { message: 'Employee ID harus berupa UUID v4 yang valid.' })
  employeeId: string;

  @ApiProperty({
    example: 12500000,
    description: 'Gaji Pokok Karyawan (Base Salary)',
  })
  @IsNotEmpty({ message: 'Gaji pokok wajib diisi.' })
  @IsNumber({}, { message: 'Gaji pokok harus berupa angka desimal valid.' })
  @Min(0, { message: 'Gaji pokok tidak boleh bernilai negatif.' })
  baseSalary: number;

  @ApiPropertyOptional({
    example: 'TK/0',
    description: 'Status PTKP Pajak (TK/0, TK/1, K/0, K/1, K/2, K/3)',
  })
  @IsOptional()
  @IsString()
  ptkpStatus?: string;

  @ApiPropertyOptional({
    type: [SalaryAllowanceItemDto],
    description: 'Daftar komponen tunjangan tetap/tidak tetap',
  })
  @IsOptional()
  @IsArray()
  allowances?: SalaryAllowanceItemDto[];

  @ApiPropertyOptional({
    type: [SalaryDeductionItemDto],
    description: 'Daftar komponen potongan rutin',
  })
  @IsOptional()
  @IsArray()
  deductions?: SalaryDeductionItemDto[];
}
