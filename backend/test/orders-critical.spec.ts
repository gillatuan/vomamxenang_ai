import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from '../src/orders/orders.service';

async function main() {
  const updates:any[]=[];
  const prisma:any={
    order:{
      findUnique: async ({where}:any)=>where.id==='missing'?null:where.id==='paid'?{status:'PAID',stripeSessionId:'cs_1'}:{status:'PENDING',stripeSessionId:null},
      update:async(args:any)=>{updates.push(args);return args;},
      create:async({data}:any)=>({id:'o1',...data,items:data.items.create})
    },
    orderItem:{deleteMany:(x:any)=>Promise.resolve(x)},
    $transaction:async(x:any[])=>Promise.all(x),
    product:{findMany:async()=>[]},wheelRim:{findMany:async()=>[]},
    client:{findUnique:async()=>null,upsert:async()=>({id:'guest',type:'RETAIL'})}
  };
  const service=new OrdersService(prisma);
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
  stripe.getStripeClient=()=>({checkout:{sessions:{create:async(args:any)=>{assert.equal(args.line_items[0].price_data.unit_amount,90);return{id:'cs_test',url:'https://example.test/checkout'};}}}});
  try {
    const out=await service.createCheckoutSession({items:[{productId:'P1',locationId:'L1',quantity:2}],clientId:'c1'}, {});
    assert.equal(out.url,'https://example.test/checkout');
    const create=updates.find(x=>x.data?.stripeSessionId==='cs_test');
    assert.ok(create,'checkout session id must be persisted');
  } finally { stripe.getStripeClient=original; }
  console.log('orders/pricing critical regression tests passed');
}
main().catch((e)=>{console.error(e);process.exit(1);});
