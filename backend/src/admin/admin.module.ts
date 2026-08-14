import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminManagementService } from './admin-management.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminDashboardService, AdminManagementService],
})
export class AdminModule {}
