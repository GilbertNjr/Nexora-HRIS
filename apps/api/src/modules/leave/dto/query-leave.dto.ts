import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { LeaveStatus } from '../../../common/enums';

export class QueryLeaveDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LeaveStatus })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @ApiPropertyOptional({ description: 'Filter Jenis Cuti (UUID)' })
  @IsOptional()
  @IsUUID()
  leaveTypeId?: string;

  @ApiPropertyOptional({ description: 'Filter Departemen (UUID)' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Tanggal mulai rentang filter' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Tanggal akhir rentang filter' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
