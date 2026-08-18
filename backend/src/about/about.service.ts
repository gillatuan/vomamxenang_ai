import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';

@Injectable()
export class AboutService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAboutDto) { return this.prisma.aboutPage.create({ data }); }
  findAll() { return this.prisma.aboutPage.findMany({ orderBy: { updatedAt: 'desc' } }); }
  findPublic() { return this.prisma.aboutPage.findFirst({ where: { isPublished: true }, orderBy: { updatedAt: 'desc' } }); }

  async findOne(id: string) {
    const about = await this.prisma.aboutPage.findUnique({ where: { id } });
    if (!about) throw new NotFoundException('Không tìm thấy nội dung giới thiệu.');
    return about;
  }

  async update(id: string, data: UpdateAboutDto) {
    await this.findOne(id);
    return this.prisma.aboutPage.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.aboutPage.delete({ where: { id } });
  }
}
