import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ClockOutDto {
  @ApiProperty({ example: -6.2255, description: 'Latitude koordinat GPS pengguna' })
  @IsNumber()
  @IsNotEmpty({ message: 'Koordinat latitude wajib dikirim' })
  latitude: number;

  @ApiProperty({ example: 106.8095, description: 'Longitude koordinat GPS pengguna' })
  @IsNumber()
  @IsNotEmpty({ message: 'Koordinat longitude wajib dikirim' })
  longitude: number;

  @ApiPropertyOptional({ example: 'data:image/jpeg;base64,...', description: 'Foto selfie bukti pulang' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ example: 'Selesai tugas harian' })
  @IsOptional()
  @IsString()
  notes?: string;
}
