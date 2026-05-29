import { Module } from '@nestjs/common';
import { WheelRimsController } from './wheel-rims.controller';
import { WheelRimsService } from './wheel-rims.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WheelRimsController],
  providers: [WheelRimsService],
})
export class WheelRimsModule {}
