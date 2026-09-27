import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token yang valid',
    example: 'dGhpc2lzYXJlZnJlc2h0b2tlbjEyMzQ1Ng==',
  })
  @IsString({ message: 'Refresh token harus berupa string' })
  @IsNotEmpty({ message: 'Refresh token tidak boleh kosong' })
  refreshToken: string;
}
