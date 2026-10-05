import { BadRequestException, Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteLeadDto } from './dto/create-quote-lead.dto';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
const closedStatuses = new Set(['WON', 'LOST']);
@Injectable()
export class QuoteLeadsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuoteLeadDto, file?: Express.Multer.File) {
    if (dto.website) throw new BadRequestException('Yêu cầu không hợp lệ.');
    let imageUrl: string | undefined;
    if (file) {
      if (!allowed.has(file.mimetype)) throw new BadRequestException('Ảnh phải là JPG, PNG hoặc WebP.');
      const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
      const blob = await put(`quotes/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`, file.buffer, { access: 'public', contentType: file.mimetype, addRandomSuffix: true });
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

  findAll(filters: { status?: 'NEW'|'CONTACTED'|'QUOTED'|'WON'|'LOST'; assigneeId?: string; overdue?: boolean }) {
    const now = new Date();
    return this.prisma.quoteLead.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
        ...(filters.overdue ? { followUpAt: { lt: now }, status: { notIn: ['WON', 'LOST'] } } : {}),
      },
      orderBy: [{ followUpAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        product: { select: { id: true, name: true, sku: true, slug: true } },
        assignee: { select: { id: true, email: true, role: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { id: true, email: true } } } },
      },
    });
  }

  async updateStatus(id: string, status: 'NEW'|'CONTACTED'|'QUOTED'|'WON'|'LOST', userId: string) {
    return this.prisma.$transaction(async tx => {
      const lead = await tx.quoteLead.update({ where: { id }, data: { status, ...(status === 'CONTACTED' ? { lastContactAt: new Date() } : {}), ...(closedStatuses.has(status) ? { followUpAt: null } : {}) } });
      await tx.quoteLeadActivity.create({ data: { leadId: id, userId, type: 'STATUS', content: `Đổi trạng thái thành ${status}` } });
      return lead;
    });
  }

  async updateCrm(id: string, data: { assigneeId?: string | null; followUpAt?: string | null }, userId: string) {
    if (data.assigneeId) {
      const user = await this.prisma.user.findUnique({ where: { id: data.assigneeId }, select: { id: true } });
      if (!user) throw new BadRequestException('Người phụ trách không hợp lệ.');
    }
    const followUpAt = data.followUpAt ? new Date(data.followUpAt) : null;
    if (data.followUpAt && Number.isNaN(followUpAt!.getTime())) throw new BadRequestException('Lịch follow-up không hợp lệ.');
    return this.prisma.$transaction(async tx => {
      const lead = await tx.quoteLead.update({ where: { id }, data: { ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId || null } : {}), ...(data.followUpAt !== undefined ? { followUpAt } : {}) } });
      await tx.quoteLeadActivity.create({ data: { leadId: id, userId, type: 'CRM_UPDATE', content: 'Cập nhật người phụ trách / lịch follow-up' } });
      return lead;
    });
  }

  async addNote(id: string, content: string, userId: string) {
    const note = content.trim();
    if (!note || note.length > 2000) throw new BadRequestException('Ghi chú phải từ 1 đến 2000 ký tự.');
    return this.activity(id, userId, 'NOTE', note);
  }

  assignees() {
    return this.prisma.user.findMany({ where: { role: { in: ['ADMIN_MANAGER', 'STOREKEEPER'] } }, orderBy: { email: 'asc' }, select: { id: true, email: true, role: true } });
  }

  private activity(leadId: string, userId: string, type: string, content: string) {
    return this.prisma.quoteLeadActivity.create({ data: { leadId, userId, type, content }, include: { user: { select: { id: true, email: true } } } });
  }
}
