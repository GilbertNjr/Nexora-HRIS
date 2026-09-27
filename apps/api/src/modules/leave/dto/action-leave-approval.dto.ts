import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '../../../common/enums';

export class ActionLeaveApprovalDto {
  @ApiProperty({
    enum: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED],
    example: ApprovalStatus.APPROVED,
    description: 'Status keputusan persetujuan (APPROVED / REJECTED)',
  })
  @IsEnum([ApprovalStatus.APPROVED, ApprovalStatus.REJECTED], {
    message: 'Status keputusan harus APPROVED atau REJECTED',
  })
  @IsNotEmpty()
  status: ApprovalStatus.APPROVED | ApprovalStatus.REJECTED;

  @ApiPropertyOptional({
    example: 'Disetujui. Pastikan pekerjaan penting telah didelegasikan.',
    description: 'Catatan dari atasan penilai / HR Admin',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
