import { Body, Controller, Get, Headers, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DailyContentService } from './daily-content.service';

@Controller('admin/daily-content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MANAGER')
export class DailyContentAdminController {
  constructor(private readonly daily: DailyContentService) {}
  @Get() current() { return this.daily.current(); }
  @Post('run') run(@Body() body: { runDate?: string }) { return this.daily.run(body.runDate); }
}

@Controller('internal/daily-content')
export class DailyContentCronController {
  constructor(private readonly daily: DailyContentService) {}
  @Post('run') async run(@Headers('authorization') authorization?: string) {
    const secret = process.env.CRON_SECRET;
    const expected = `Bearer ${secret || ''}`;
    if (!secret || !authorization || authorization.length !== expected.length || !timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))) throw new UnauthorizedException();
    return this.daily.run();
  }
}
