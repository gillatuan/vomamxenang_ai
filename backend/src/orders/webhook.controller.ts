import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { getStripeClient } from '../stripe';
import { PrismaService } from '../prisma/prisma.service';

@Controller('orders')
export class OrdersWebhookController {
  constructor(private prisma: PrismaService) {}

  @Post('webhook')
  async handle(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const raw = (req as any).rawBody as Buffer | undefined;
    if (!sig || !raw) {
      return res.status(400).json({ error: 'Missing signature or raw body' });
    }

    const stripe = this.getStripeClientForWebhook();
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const stripeSessionId = session.id as string;
      const order = await this.prisma.order.findUnique({
        where: { stripeSessionId },
        include: { items: true },
      });

      if (order && order.status !== 'PAID') {
        try {
          await this.prisma.$transaction(async (tx) => {
            const deductions: Array<{ stockId: string; quantity: number }> = [];

            for (const item of order.items) {
              const stock = await tx.stockLocation.findFirst({
                where: {
                  locationId: item.locationId,
                  productId: item.productId ?? undefined,
                  wheelRimId: item.wheelRimId ?? undefined,
                },
              });

              if (!stock || stock.quantity < item.quantity) {
                throw new Error('INSUFFICIENT_STOCK');
              }

              deductions.push({ stockId: stock.id, quantity: item.quantity });
            }

            for (const deduction of deductions) {
              await tx.stockLocation.update({
                where: { id: deduction.stockId },
                data: { quantity: { decrement: deduction.quantity } },
              });
            }

            await tx.order.update({
              where: { id: order.id },
              data: { status: 'PAID' },
            });
          });
        } catch (err) {
          if (err instanceof Error && err.message === 'INSUFFICIENT_STOCK') {
            return res.status(409).json({ error: 'Insufficient stock for order fulfillment' });
          }
          throw err;
        }
      }
    }

    res.json({ received: true });
  }
}
