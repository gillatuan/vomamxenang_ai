import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';
import { StoreInfoService } from './store-info.service';

@Controller('store-info')
export class StoreInfoController {
  constructor(private service: StoreInfoService) {}

  /** Public, deliberately limited data used by the storefront footer. */
  @Get('public') findPublic() { return this.service.findPublic(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Post() create(@Body() data: CreateStoreInfoDto) { return this.service.create(data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Get() findAll() { return this.service.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateStoreInfoDto) { return this.service.update(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
