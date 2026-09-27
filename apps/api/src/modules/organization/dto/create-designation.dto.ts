import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDesignationDto {
  @ApiProperty({ example: 'SWE', description: 'Kode unik jabatan' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Senior Software Engineer', description: 'Nama gelar jabatan' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'ID Departemen', example: 'uuid-department-id' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;
}
