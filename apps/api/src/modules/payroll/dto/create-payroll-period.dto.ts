import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreatePayrollPeriodDto {
  @ApiProperty({
    example: '2026-10',
    description: 'Kode periode penggajian format YYYY-MM',
  })
  @IsNotEmpty({ message: 'Kode periode wajib diisi.' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Format kode periode harus YYYY-MM (contoh: 2026-10).',
  })
  code: string;

  @ApiProperty({
    example: 'Periode Penggajian Oktober 2026',
    description: 'Nama deskriptif periode penggajian',
  })
  @IsNotEmpty({ message: 'Nama periode wajib diisi.' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '2026-10-01',
    description: 'Tanggal awal cut-off kehadiran dan perhitungan',
  })
  @IsNotEmpty({ message: 'Tanggal mulai wajib diisi.' })
  @IsDateString({}, { message: 'Format tanggal mulai harus YYYY-MM-DD.' })
  startDate: string;

  @ApiProperty({
    example: '2026-10-31',
    description: 'Tanggal akhir cut-off penggajian',
  })
  @IsNotEmpty({ message: 'Tanggal akhir wajib diisi.' })
  @IsDateString({}, { message: 'Format tanggal akhir harus YYYY-MM-DD.' })
  endDate: string;
}
