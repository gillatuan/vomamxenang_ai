import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getStripeClient } from '../stripe';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.order.findMany({ include: { client: true }, orderBy: { createdAt: 'desc' } });
  }

  async create(data: any) {
    return this.prisma.order.create({ data });
  }

  async createCheckoutSession(body: any, req: any) {
    const items = body.items as Array<{ id: string; quantity: number }>;
    const productIds = items.map((i) => i.id);
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    const total = items.reduce((s, it) => {
      const p = products.find((x) => x.id === it.id)!;
      const price = p.sellingPrice ? Number(p.sellingPrice.toString()) : Number(p.importPrice.toString());
      return s + price * it.quantity;
    }, 0);

    const client = await this.prisma.client.upsert({ where: { email: 'guest@vomamxenang.local' }, update: { name: 'Guest' }, create: { name: 'Guest', email: 'guest@vomamxenang.local' } });

    const order = await this.prisma.order.create({ data: { client: { connect: { id: client.id } }, totalAmount: total, status: 'PENDING' } });

    const stripe = getStripeClient();
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items.map((it) => {
        const p = products.find((x) => x.id === it.id)!;
        const unitPrice = p.sellingPrice ? Number(p.sellingPrice.toString()) : Number(p.importPrice.toString());
        return {
          price_data: { currency: 'usd', product_data: { name: p.name }, unit_amount: Math.round(unitPrice * 100) },
          quantity: it.quantity,
        };
      }),
      metadata: { orderId: order.id, itemIds: items.map((i) => i.id).join(','), itemQuantities: items.map((i) => String(i.quantity)).join(',') },
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    await this.prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return { url: session.url };
  }
}
