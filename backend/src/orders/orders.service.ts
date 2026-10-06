import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getStripeClient } from '../stripe';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Client } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.order.findMany({ include: { client: true, payments: { orderBy: { receivedAt: 'desc' }, include: { createdBy: { select: { id: true, email: true } } } }, fulfillment: { select: { id: true, code: true, status: true, confirmedAt: true } }, items: { include: { product: true, wheelRim: true, location: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new BadRequestException('Stripe webhook is not configured');
    let event;
    try { event = getStripeClient().webhooks.constructEvent(rawBody, signature, secret); }
    catch { throw new BadRequestException('Invalid Stripe webhook signature'); }
    if (event.type !== 'checkout.session.completed') return { received: true };
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (!orderId || session.payment_status !== 'paid') return { received: true };
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.orderPayment.findUnique({ where: { externalId: session.id } });
      if (existing) return { received: true };
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { payments: true } });
      if (!order || order.stripeSessionId !== session.id) throw new BadRequestException('Stripe session does not match order');
      const paid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const stripeAmount = session.currency === 'vnd' ? (session.amount_total ?? 0) : (session.amount_total ?? 0) / 100;
      const amount = Math.min(Math.max(0, order.totalAmount - paid), stripeAmount);
      if (amount > 0) await tx.orderPayment.create({ data: { orderId, amount, method: PaymentMethod.STRIPE, externalId: session.id, reference: session.payment_intent ? String(session.payment_intent) : session.id, receivedAt: new Date(), createdById: null } });
      if (paid + amount >= order.totalAmount) await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.PAID } });
      return { received: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async updatePaymentDueDate(id: string, paymentDueDate: string | null) {
    const order = await this.prisma.order.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!order) throw new BadRequestException('Order not found');
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Only pending orders can have a payment due date');
    const due = paymentDueDate ? new Date(`${paymentDueDate}T00:00:00.000Z`) : null;
    if (due && Number.isNaN(due.getTime())) throw new BadRequestException('Invalid payment due date');
    return this.prisma.order.update({ where: { id }, data: { paymentDueAt: due } });
  }

  async receivables() {
    const orders = await this.prisma.order.findMany({
      where: { status: OrderStatus.PENDING },
      include: { client: { select: { id: true, name: true, phone: true, company: true } }, payments: { select: { amount: true } } },
      orderBy: [{ paymentDueAt: 'asc' }, { createdAt: 'asc' }],
    });
    const vietnamDateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const todayUtc = Date.parse(`${vietnamDateKey}T00:00:00.000Z`);
    return orders.map(order => {
      const paidAmount = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const balance = Math.max(0, order.totalAmount - paidAmount);
      const dueUtc = order.paymentDueAt ? Date.UTC(order.paymentDueAt.getUTCFullYear(), order.paymentDueAt.getUTCMonth(), order.paymentDueAt.getUTCDate()) : null;
      const overdueDays = dueUtc === null ? 0 : Math.max(0, Math.floor((todayUtc - dueUtc) / 86400000));
      const agingBucket = dueUtc === null || dueUtc >= todayUtc ? 'CURRENT' : overdueDays <= 30 ? '1_30' : overdueDays <= 60 ? '31_60' : overdueDays <= 90 ? '61_90' : '90_PLUS';
      return { id: order.id, code: order.code, createdAt: order.createdAt, paymentDueAt: order.paymentDueAt, totalAmount: order.totalAmount, paidAmount, balance, overdueDays, agingBucket, client: order.client };
    }).filter(order => order.balance > 0);
  }

  async recordPayment(id: string, input: { amount: number; method: PaymentMethod; reference?: string; note?: string; receivedAt?: string }, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { payments: true } });
      if (!order) throw new BadRequestException('Order not found');
      if (order.status === OrderStatus.FAILED) throw new BadRequestException('Failed orders cannot receive payment');
      if (input.method === PaymentMethod.STRIPE) throw new BadRequestException('Stripe payments are recorded by webhook');
      const paid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const balance = Math.max(0, order.totalAmount - paid);
      if (input.amount <= 0 || input.amount > balance) throw new BadRequestException('Payment amount exceeds outstanding balance');
      const receivedAt = input.receivedAt ? new Date(input.receivedAt) : new Date();
      if (Number.isNaN(receivedAt.getTime())) throw new BadRequestException('Invalid payment date');
      const payment = await tx.orderPayment.create({ data: { orderId: id, amount: input.amount, method: input.method, reference: input.reference?.trim() || null, note: input.note?.trim() || null, receivedAt, createdById: userId } });
      const newPaid = paid + input.amount;
      if (newPaid >= order.totalAmount) await tx.order.update({ where: { id }, data: { status: OrderStatus.PAID } });
      return { payment, paidAmount: newPaid, balance: Math.max(0, order.totalAmount - newPaid), status: newPaid >= order.totalAmount ? OrderStatus.PAID : order.status };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
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
        const fulfillment = await tx.inventoryTransaction.create({ data: { code: `EXPORT-ORDER-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`, type: 'EXPORT', partnerName: order.client.name, userId, orderId: order.id, details: { create: order.items.map(item => ({ productId: item.productId, wheelRimId: item.wheelRimId, locationId: item.locationId, quantity: item.quantity, price: item.price })) } }, include: { details: true } });
        return fulfillment;
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
    const order = await this.prisma.order.findUnique({ where: { id }, select: { status: true, fulfillment: { select: { id: true } }, payments: { select: { id: true } } } });
    if (!order) throw new BadRequestException('Order not found');
    if (order.status === OrderStatus.PAID) throw new BadRequestException('A paid order status can only be changed by the payment webhook');
    if (order.fulfillment || order.payments.length) throw new BadRequestException('Orders with fulfillment or payments cannot change status manually');
    return this.prisma.$transaction(async tx => {
      const updated = await tx.order.update({ where: { id }, data: { status } });
      if (status === OrderStatus.FAILED) {
        await tx.stockReservation.updateMany({
          where: { orderId: id, status: 'ACTIVE' },
          data: { status: 'RELEASED', releasedAt: new Date() },
        });
      }
      return updated;
    });
  }

  async deleteDraft(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, select: { status: true, stripeSessionId: true, fulfillment: { select: { id: true } }, payments: { select: { id: true } } } });
    if (!order) throw new BadRequestException('Order not found');
    if (order.status === OrderStatus.PAID || order.stripeSessionId || order.fulfillment || order.payments.length) throw new BadRequestException('Paid, checkout, or fulfillment orders cannot be deleted');
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
          currency: 'vnd',
          product_data: { name: checkout.description },
          unit_amount: Math.round(checkout.price),
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
