import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ example: 'REG-01', description: 'Kode unik shift' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Shift Pagi Reguler' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '09:00', description: 'Jam mulai (format HH:mm)' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format jam mulai harus HH:mm (contoh: 09:00)',
  })
  startTime: string;

  @ApiProperty({ example: '18:00', description: 'Jam selesai (format HH:mm)' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format jam selesai harus HH:mm (contoh: 18:00)',
  })
  endTime: string;

  @ApiPropertyOptional({ example: 15, default: 15, description: 'Toleransi keterlambatan dalam menit' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  graceMinutes?: number = 15;
}
