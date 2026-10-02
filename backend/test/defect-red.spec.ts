import assert from 'node:assert/strict';
import { InventoryService } from '../src/inventory/inventory.service';
import { OrdersWebhookController } from '../src/orders/webhook.controller';

async function inventoryMustBeAtomic() {
  let directWrites = 0;
  let transactionCalls = 0;
  const transaction = {
    id: 'issue-atomic',
    type: 'EXPORT',
    details: [
      { locationId: 'L1', productId: 'P1', wheelRimId: null, quantity: 2 },
      { locationId: 'L2', productId: 'P2', wheelRimId: null, quantity: 2 },
    ],
  };
  const prisma: any = {
    inventoryTransaction: { findUnique: async () => transaction },
    stockLocation: {
      findFirst: async ({ where }: any) => where.locationId === 'L1' ? { id: 'S1', quantity: 5 } : { id: 'S2', quantity: 1 },
      update: async () => { directWrites += 1; return {}; },
    },
    $transaction: async (fn: any) => {
      transactionCalls += 1;
      if (typeof fn === 'function') return fn(prisma);
      return Promise.all(fn);
    },
  };
  const service = new InventoryService(prisma);
  await assert.rejects(() => service.confirmIssue('issue-atomic'), /Insufficient stock/);
  assert.equal(transactionCalls, 1, 'multi-line issue confirmation must execute inside one database transaction');
  assert.equal(directWrites, 0, 'validation failure must not write any stock row');
}

async function webhookMustBeIdempotentAndStockSafe() {
  let status: 'PENDING' | 'PAID' = 'PENDING';
  let stock = 5;
  const prisma: any = {
    order: {
      findUnique: async () => ({ id: 'O1', status, items: [{ locationId: 'L1', productId: 'P1', wheelRimId: null, quantity: 3 }] }),
      update: ({ data }: any) => ({ run: async () => { status = data.status; } }),
    },
    stockLocation: {
      updateMany: ({ data }: any) => ({ run: async () => { stock -= data.quantity.decrement; return { count: 1 }; } }),
    },
    $transaction: async (ops: any[]) => { for (const op of ops) await op.run(); },
  };
  const stripe: any = { webhooks: { constructEvent: () => ({ type: 'checkout.session.completed', data: { object: { id: 'cs_1' } } }) } };
  const controller = new OrdersWebhookController(prisma, stripe);
  const request: any = { headers: { 'stripe-signature': 'sig' }, rawBody: Buffer.from('{}') };
  const response = () => { const r: any = {}; r.status = () => r; r.json = () => r; return r; };

  await controller.handle(request, response());
  await controller.handle(request, response());
  assert.equal(stock, 2, 'duplicate checkout.session.completed delivery must not decrement stock twice');

  status = 'PENDING'; stock = 2;
  await assert.rejects(() => controller.handle(request, response()), /Insufficient stock/);
  assert.equal(status, 'PENDING', 'insufficient stock must not mark the order paid');
  assert.equal(stock, 2, 'insufficient stock must not decrement inventory');
}

async function main() {
  await inventoryMustBeAtomic();
  await webhookMustBeIdempotentAndStockSafe();
  console.log('defect regression tests passed');
}
main().catch((error) => { console.error(error); process.exit(1); });
