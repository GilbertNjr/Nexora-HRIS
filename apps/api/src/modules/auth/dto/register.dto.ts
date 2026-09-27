import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'karyawan@nexora.local' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ example: 'NexoraPass2026!', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter' })
  password: string;

  @ApiPropertyOptional({ example: 'EMPLOYEE', default: 'EMPLOYEE' })
  @IsOptional()
  @IsString()
  roleName?: string = 'EMPLOYEE';
}
