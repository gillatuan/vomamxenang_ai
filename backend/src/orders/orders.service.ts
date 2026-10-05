import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getStripeClient } from '../stripe';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Client } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.order.findMany({ include: { client: true, fulfillment: { select: { id: true, code: true, status: true, confirmedAt: true } }, items: { include: { product: true, wheelRim: true, location: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async createFulfillment(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { client: true, items: true, fulfillment: true } });
      if (!order) throw new BadRequestException('Order not found');
      if (order.fulfillment) return order.fulfillment;
      if (order.status === OrderStatus.FAILED) throw new BadRequestException('Failed orders cannot be fulfilled');
      if (!order.items.length) throw new BadRequestException('Order has no items');
      const demand = new Map<string, { productId?: string; wheelRimId?: string; locationId: string; quantity: number }>();
      for (const item of order.items) {
        const key = `${item.productId ?? ''}:${item.wheelRimId ?? ''}:${item.locationId}`;
        const current = demand.get(key);
        demand.set(key, { productId: item.productId ?? undefined, wheelRimId: item.wheelRimId ?? undefined, locationId: item.locationId, quantity: (current?.quantity ?? 0) + item.quantity });
      }
      for (const required of demand.values()) {
        const stock = await tx.stockLocation.findFirst({ where: { locationId: required.locationId, productId: required.productId, wheelRimId: required.wheelRimId }, select: { quantity: true } });
        if (!stock || stock.quantity < required.quantity) throw new BadRequestException('Insufficient stock to create fulfillment');
      }
      try {
        return await tx.inventoryTransaction.create({ data: { code: `EXPORT-ORDER-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`, type: 'EXPORT', partnerName: order.client.name, userId, orderId: order.id, details: { create: order.items.map(item => ({ productId: item.productId, wheelRimId: item.wheelRimId, locationId: item.locationId, quantity: item.quantity, price: item.price })) } }, include: { details: true } });
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          const existing = await tx.inventoryTransaction.findUnique({ where: { orderId: order.id }, include: { details: true } });
          if (existing) return existing;
        }
        throw error;
      }
    });
  }

   async updateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id }, select: { status: true, fulfillment: { select: { id: true } } } });
    if (!order) throw new BadRequestException('Order not found');
    if (order.status === OrderStatus.PAID) throw new BadRequestException('A paid order status can only be changed by the payment webhook');
    if (order.fulfillment) throw new BadRequestException('Orders with fulfillment cannot change status manually');
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async deleteDraft(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, select: { status: true, stripeSessionId: true, fulfillment: { select: { id: true } } } });
    if (!order) throw new BadRequestException('Order not found');
    if (order.status === OrderStatus.PAID || order.stripeSessionId || order.fulfillment) throw new BadRequestException('Paid, checkout, or fulfillment orders cannot be deleted');
    return this.prisma.$transaction([
      this.prisma.orderItem.deleteMany({ where: { orderId: id } }),
      this.prisma.order.delete({ where: { id } }),
    ]);
  }

  async createCheckoutSession(body: {items:Array<{productId?:string;wheelRimId?:string;locationId:string;quantity:number}>;clientId?:string;customerType?:'RETAIL'|'B2B_TIER1'|'B2B_TIER2'}, req: AuthenticatedRequest) {
    const items = body.items;
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
    const authUser = req.user;

    let client: Client | null = null;
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
