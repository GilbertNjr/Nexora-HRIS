import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@nexora.local',
    description: 'Email pengguna yang terdaftar',
  })
  @IsEmail({}, { message: 'Format alamat email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({
    example: 'Admin@Nexora2026!',
    description: 'Kata sandi pengguna',
    minLength: 8,
  })
  @IsString({ message: 'Kata sandi harus berupa teks' })
  @IsNotEmpty({ message: 'Kata sandi tidak boleh kosong' })
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter' })
  password: string;
}
