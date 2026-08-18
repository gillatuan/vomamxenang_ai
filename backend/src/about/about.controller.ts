import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';

@Controller('about')
export class AboutController {
  constructor(private service: AboutService) {}

  @Get('public') findPublic() { return this.service.findPublic(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Get() findAll() { return this.service.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Post() create(@Body() data: CreateAboutDto) { return this.service.create(data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateAboutDto) { return this.service.update(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
