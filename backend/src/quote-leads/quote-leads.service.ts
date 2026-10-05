import { BadRequestException, Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteLeadDto } from './dto/create-quote-lead.dto';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
@Injectable()
export class QuoteLeadsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuoteLeadDto, file?: Express.Multer.File) {
    if (dto.website) throw new BadRequestException('Yêu cầu không hợp lệ.');
    let imageUrl: string | undefined;
    if (file) {
      if (!allowed.has(file.mimetype)) throw new BadRequestException('Ảnh phải là JPG, PNG hoặc WebP.');
      const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
      const blob = await put(`quotes/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`, file.buffer, {
        access: 'public', contentType: file.mimetype, addRandomSuffix: true,
      });
      imageUrl = blob.url;
    }
    const { website, quantity: quantityValue, ...data } = dto;
    if (data.productId) {
      const exists = await this.prisma.product.findUnique({ where: { id: data.productId }, select: { id: true } });
      if (!exists) data.productId = undefined;
    }
    const quantity = quantityValue == null ? undefined : Number(quantityValue);
    if (quantity != null && (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000)) throw new BadRequestException('Số lượng không hợp lệ.');
    return this.prisma.quoteLead.create({ data: { ...data, quantity, imageUrl, source: 'WEBSITE' }, select: { id: true, status: true, createdAt: true } });
  }

  findAll() {
    return this.prisma.quoteLead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, sku: true, slug: true } } },
    });
  }

  updateStatus(id: string, status: 'NEW'|'CONTACTED'|'QUOTED'|'WON'|'LOST') {
    return this.prisma.quoteLead.update({ where: { id }, data: { status } });
  }
}
