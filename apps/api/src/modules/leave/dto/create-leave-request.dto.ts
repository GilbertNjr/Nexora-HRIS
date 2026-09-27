import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'ID Master Jenis Cuti (UUID)' })
  @IsUUID()
  @IsNotEmpty({ message: 'Jenis cuti wajib dipilih' })
  leaveTypeId: string;

  @ApiProperty({ example: '2026-10-05', description: 'Tanggal mulai cuti (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Format tanggal mulai cuti tidak valid' })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-10-06', description: 'Tanggal selesai cuti (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Format tanggal selesai cuti tidak valid' })
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 2, description: 'Jumlah hari kerja cuti yang diambil' })
  @IsNumber()
  @Min(0.5, { message: 'Jumlah hari cuti minimal 0.5 hari' })
  totalDays: number;

  @ApiProperty({ example: 'Keperluan keluarga di luar kota', description: 'Alasan pengajuan cuti' })
  @IsString()
  @IsNotEmpty({ message: 'Alasan permohonan cuti wajib diisi' })
  reason: string;

  @ApiPropertyOptional({
    example: 'https://storage.nexora.local/documents/surat-sakit-01.jpg',
    description: 'URL berkas lampiran (wajib untuk cuti sakit sesuai [REQ-DEC-06])',
  })
  @IsOptional()
  @IsString()
  documentUrl?: string;
}
