import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerChatService {
  constructor(private prisma: PrismaService) {}

  private money(value: number | null | undefined) {
    return typeof value === 'number' && value > 0
      ? new Intl.NumberFormat('vi-VN').format(value) + 'đ'
      : 'Liên hệ báo giá';
  }

  async reply(message: string) {
    const query = (message || '').trim().toLowerCase();
    const size = query.match(/\b\d{1,2}(?:[.,]\d{1,2})?[-x]\d{1,2}(?:[.,]\d{1,2})?(?:[-x]\d{1,2}(?:[.,]\d{1,2})?)?\b/)?.[0]?.replace(',', '.');
    const wantsRim = /mâm|mam|rim/.test(query);
    const wantsService = /dịch vụ|dich vu|ép|ep vo|lắp|lap|thay/.test(query);

    const productWhere: any = { status: 'PUBLISHED' };
    if (size) productWhere.size = { contains: size, mode: 'insensitive' };
    const products = await this.prisma.product.findMany({
      where: productWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id:true, name:true, size:true, brand:true, tireType:true, condition:true, sellingPrice:true, slug:true, shortDescription:true },
    });

    const rims = wantsRim || size ? await this.prisma.wheelRim.findMany({
      where: size ? { size: { contains: size, mode: 'insensitive' } } : undefined,
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: { id:true, sku:true, size:true, brand:true, boltHoles:true, compatibleModels:true, sellingPrice:true },
    }) : [];

    const items = [
      ...products.map(p => ({
        kind: 'product' as const, id:p.id, name:p.name, size:p.size, brand:p.brand,
        detail:[p.tireType, p.condition].filter(Boolean).join(' · '),
        price:p.sellingPrice, priceText:this.money(p.sellingPrice),
        href:`/products/${p.slug || p.id}`,
        description:p.shortDescription,
      })),
      ...rims.map(r => ({
        kind:'rim' as const, id:r.id, name:`Mâm xe nâng ${r.size || r.sku}`, size:r.size, brand:r.brand,
        detail:[r.boltHoles ? `${r.boltHoles} lỗ` : '', r.compatibleModels].filter(Boolean).join(' · '),
        price:r.sellingPrice, priceText:this.money(r.sellingPrice), href:`/mam-xe-nang/${r.id}`,
      })),
    ].slice(0, 6);

    let text = size
      ? `Mình đã tìm các sản phẩm phù hợp kích thước ${size}. Giá dưới đây lấy trực tiếp từ bảng giá hiện tại trên hệ thống.`
      : 'Mình có thể hỗ trợ tìm vỏ xe nâng, mâm xe nâng và báo giá theo dữ liệu hiện có. Bạn cho mình kích thước trên hông vỏ (ví dụ 6.50-10, 6.00-9, 3.25-15) để tư vấn chính xác hơn.';
    if (!items.length && size) text = `Hiện hệ thống chưa có sản phẩm công khai khớp chính xác ${size}. Bạn có thể để lại nhu cầu để cửa hàng kiểm tra kho và báo giá.`;

    return {
      text,
      items,
      services: wantsService || !size ? [
        { name:'Ép / thay vỏ xe nâng', priceText:'Liên hệ báo giá', note:'Báo giá theo kích thước, loại vỏ và tình trạng mâm.' },
        { name:'Tư vấn vỏ và mâm phù hợp', priceText:'Miễn phí tư vấn', note:'Đối chiếu kích thước, loại vỏ và cấu hình xe.' },
      ] : [],
      disclaimer:'Giá sản phẩm là giá đang công khai trên hệ thống; phí dịch vụ và giá cần xác nhận sẽ được cửa hàng báo lại trước khi thực hiện.',
      followUp: size ? 'Bạn cần vỏ đặc, vỏ hơi, mâm hay dịch vụ ép vỏ?' : 'Bạn đang cần kích thước nào?',
    };
  }
}
