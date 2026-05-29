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

    const stripe = getStripeClient();
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

      if (order) {
        await this.prisma.$transaction([
          this.prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } }),
          ...order.items.map((item) =>
            this.prisma.stockLocation.updateMany({
              where: {
                locationId: item.locationId,
                productId: item.productId ?? undefined,
                wheelRimId: item.wheelRimId ?? undefined,
              },
              data: {
                quantity: { decrement: item.quantity },
              },
            }),
          ),
        ]);
      }
    }

    res.json({ received: true });
  }
}
