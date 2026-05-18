import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Controller('orders')
export class OrdersWebhookController {
  constructor(private prisma: PrismaService) {}

  @Post('webhook')
  async handle(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const raw = (req as any).rawBody as Buffer | undefined;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2026-04-22.dahlia' });
    if (!sig || !raw) {
      return res.status(400).json({ error: 'Missing signature or raw body' });
    }
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const stripeId = session.id as string;
      await this.prisma.order.updateMany({ where: { stripeSessionId: stripeId }, data: { status: 'PAID' } });

      const itemIds = (session.metadata?.itemIds as string)?.split(',') ?? [];
      const itemQuantities = ((session.metadata?.itemQuantities as string)?.split(',') ?? []).map((v: string) => Number(v));
      if (itemIds.length === itemQuantities.length) {
        await Promise.all(
          itemIds.map((id: string, idx: number) =>
            this.prisma.product.update({ where: { id }, data: { quantityInStock: { decrement: itemQuantities[idx] ?? 0 } } }),
          ),
        );
      }
    }

    res.json({ received: true });
  }
}
