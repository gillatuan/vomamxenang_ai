import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from '../src/orders/orders.service';

async function main() {
  const updates:any[]=[];
  let transactionAttempts=0;
  const prisma:any={
    order:{
      updateMany:async(args:any)=>{updates.push(args);return {count:1};},
      findUnique: async ({where}:any)=>where.id==='missing'?null:where.id==='paid'?{status:'PAID',stripeSessionId:'cs_1'}:{status:'PENDING',stripeSessionId:null},
      update:async(args:any)=>{updates.push(args);return args;},
      create:async({data}:any)=>({id:'o1',...data,items:data.items.create})
    },
    orderItem:{deleteMany:(x:any)=>Promise.resolve(x)},
    stockLocation:{findFirst:async()=>({quantity:5})},
    stockReservation:{
      aggregate:async()=>({_sum:{quantity:0}}),
      createMany:async(args:any)=>args,
      findMany:async()=>[],
      updateMany:async(args:any)=>{updates.push(args);return {count:1};},
    },
    $queryRaw:async()=>[],
    $transaction:async(x:any)=>{transactionAttempts++;return typeof x==='function'?x(prisma):Promise.all(x);},
    product:{findMany:async()=>[]},wheelRim:{findMany:async()=>[]},
    client:{findUnique:async()=>null,upsert:async()=>({id:'guest',type:'RETAIL'})}
  };
  const service=new OrdersService(prisma);
  // Serializable operations retry transient Prisma P2034 conflicts, but only up to the bounded limit.
  const retryPrisma:any={...prisma,$transaction:async(x:any)=>{transactionAttempts++;if(transactionAttempts<3){const e:any=new Error('write conflict');e.code='P2034';Object.setPrototypeOf(e,require('@prisma/client').Prisma.PrismaClientKnownRequestError.prototype);throw e;}return x(retryPrisma);}};
  const retryService=new OrdersService(retryPrisma);
  transactionAttempts=0;
  await retryService.releaseExpiredReservations(new Date());
  assert.equal(transactionAttempts,3,'P2034 serialization conflicts must retry with a bounded attempt count');
  transactionAttempts=0;
  await assert.rejects(()=>service.updateStatus('missing','PENDING' as any),BadRequestException);
  await assert.rejects(()=>service.updateStatus('paid','CANCELLED' as any),BadRequestException);
  await assert.rejects(()=>service.deleteDraft('paid'),BadRequestException);
  await assert.rejects(()=>service.createCheckoutSession({items:[]},{}),BadRequestException);

  // Pricing contract: customer-specific matrix wins over selling/import fallback.
  prisma.product.findMany=async()=>[{id:'P1',name:'Tire',sellingPrice:120,importPrice:80,priceMatrix:[{customerType:'WHOLESALE',price:90}]}];
  prisma.client.findUnique=async()=>({id:'c1',type:'WHOLESALE'});
  process.env.STRIPE_SECRET_KEY='sk_test_placeholder';
  const stripe=require('../src/stripe');
  const original=stripe.getStripeClient;
  stripe.getStripeClient=()=>({checkout:{sessions:{
    create:async(args:any)=>{
      assert.equal(args.line_items[0].price_data.unit_amount,90);
      assert.ok(Number.isInteger(args.expires_at),'Stripe expiry must match reservation lifecycle');
      return{id:'cs_test',url:'https://example.test/checkout'};
    },
    expire:async()=>({id:'cs_test'})
  }}});
  try {
    const out=await service.createCheckoutSession({items:[{productId:'P1',locationId:'L1',quantity:2}],clientId:'c1'}, {});
    assert.equal(out.url,'https://example.test/checkout');
    const create=updates.find(x=>x.data?.stripeSessionId==='cs_test');
    assert.ok(create,'checkout session id must be persisted');
  } finally { stripe.getStripeClient=original; }

  // All reservations for an expired order must be released together, even when only one line has reached expiry.
  prisma.stockReservation.findMany=async()=>[{orderId:'o1'}];
  updates.length=0;
  await service.releaseExpiredReservations(new Date());
  const releaseExpired=updates.find(x=>x.where?.orderId?.in);
  assert.equal(releaseExpired?.where?.expiresAt,undefined,'expiry recovery must release every ACTIVE reservation on the failed order');

  // Stripe session failure must compensate the order reservation.
  stripe.getStripeClient=()=>({checkout:{sessions:{create:async()=>{throw new Error('stripe unavailable');}}}});
  try {
    await assert.rejects(()=>service.createCheckoutSession({items:[{productId:'P1',locationId:'L1',quantity:1}],clientId:'c1'}, {}));
    assert.ok(updates.some(x=>x.data?.status==='RELEASED'),'failed checkout must release ACTIVE reservations');
    assert.ok(updates.some(x=>x.data?.status==='FAILED'),'failed checkout must fail the orphan order');
  } finally { stripe.getStripeClient=original; }
  console.log('orders/pricing critical regression tests passed');
}
main().catch((e)=>{console.error(e);process.exit(1);});
