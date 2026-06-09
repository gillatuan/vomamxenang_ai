import { Injectable, BadRequestException } from '@nestjs/common';
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
    const items = body.items as Array<{
      productId?: string;
      wheelRimId?: string;
      locationId?: string;
      quantity: number;
    }>;
    const customerType = body.customerType ?? 'RETAIL';

    if (!items || items.length === 0) {
      throw new BadRequestException('No items provided');
    }

    const productIds = items.filter((item) => item.productId).map((item) => item.productId!);
    const wheelRimIds = items.filter((item) => item.wheelRimId).map((item) => item.wheelRimId!);

    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } }, include: { priceMatrix: true } });
    const wheelRims = await this.prisma.wheelRim.findMany({ where: { id: { in: wheelRimIds } } });

    // Support two checkout assumptions:
    // - Logged-in user: attempt to resolve a Client by authenticated user's email (req.user.email)
    // - Guest (anonymous): use provided clientId or create/lookup a guest client record
    const authUser = req?.user as { sub?: string; email?: string } | undefined;

    let client = null as any;
    if (authUser?.email) {
      client = await this.prisma.client.findUnique({ where: { email: authUser.email } });
    }

    if (!client && body.clientId) {
      client = await this.prisma.client.findUnique({ where: { id: body.clientId } });
    }

    if (!client) {
      client = await this.prisma.client.upsert({
        where: { email: 'guest@vomamxenang.local' },
        update: { name: 'Guest' },
        create: { name: 'Guest', email: 'guest@vomamxenang.local', phone: '', company: 'Guest', type: 'RETAIL' },
      });
    }

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // If customerType wasn't explicitly provided, derive from resolved client (guest or real client)
    const effectiveCustomerType = body.customerType ?? client.type ?? 'RETAIL';

    const checkoutItems = items.map((item) => {
      const product = item.productId ? products.find((p) => p.id === item.productId) : undefined;
      const wheelRim = item.wheelRimId ? wheelRims.find((w) => w.id === item.wheelRimId) : undefined;
      const price = product
        ? Number(
            product.priceMatrix.find((matrix) => matrix.customerType === effectiveCustomerType)?.price ?? product.sellingPrice ?? product.importPrice,
          )
        : wheelRim
        ? Number(wheelRim.sellingPrice ?? wheelRim.importPrice)
        : undefined;

      if (price === undefined) {
        throw new BadRequestException('Unable to calculate price for one of the items');
      }

      return {
        item,
        description: product ? product.name : wheelRim ? wheelRim.sku : 'Unknown item',
        price,
      };
    });

    const total = checkoutItems.reduce((sum, item) => sum + item.price * item.item.quantity, 0);

    for (const checkout of checkoutItems) {
      if (!checkout.item.locationId) {
        throw new BadRequestException('Each order line requires locationId for stock deduction');
      }
    }

    const order = await this.prisma.order.create({
      data: {
        client: { connect: { id: client.id } },
        totalAmount: total,
        status: 'PENDING',
        items: {
          create: checkoutItems.map((checkout) => ({
            productId: checkout.item.productId,
            wheelRimId: checkout.item.wheelRimId,
            locationId: checkout.item.locationId!,
            quantity: checkout.item.quantity,
            price: checkout.price,
          })),
        },
      },
      include: { items: true },
    });

    const stripe = getStripeClient();
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: checkoutItems.map((checkout) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: checkout.description },
          unit_amount: Math.round(checkout.price * 100),
        },
        quantity: checkout.item.quantity,
      })),
      metadata: { orderId: order.id },
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    await this.prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return { url: session.url };
  }
}
