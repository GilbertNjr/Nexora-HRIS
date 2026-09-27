import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ClockInDto {
  @ApiProperty({ example: -6.2255, description: 'Latitude koordinat GPS pengguna' })
  @IsNumber()
  @IsNotEmpty({ message: 'Koordinat latitude wajib dikirim' })
  latitude: number;

  @ApiProperty({ example: 106.8095, description: 'Longitude koordinat GPS pengguna' })
  @IsNumber()
  @IsNotEmpty({ message: 'Koordinat longitude wajib dikirim' })
  longitude: number;

  @ApiPropertyOptional({ example: 'data:image/jpeg;base64,...', description: 'Foto selfie bukti presensi' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ example: 'Clock-in dari kantor pusat lantai 18' })
  @IsOptional()
  @IsString()
  notes?: string;
}
