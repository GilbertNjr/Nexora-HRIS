import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeeModule } from './modules/employees/employee.module';
import { HealthModule } from './modules/health/health.module';
import { LeaveModule } from './modules/leave/leave.module';
import { OrganizationModule } from './modules/organization/organization.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    OrganizationModule,
    EmployeeModule,
    AttendanceModule,
    LeaveModule,
  ],
})
export class AppModule {}
