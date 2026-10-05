import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { OrdersService } from '../src/orders/orders.service';

async function main() {
  let order={id:'O1',stripeSessionId:'cs_test',status:OrderStatus.PENDING,totalAmount:100,payments:[] as Array<{amount:number}>};
  let paymentCreates=0,orderUpdates=0,stockCalls=0;
  const tx={
    orderPayment:{
      findUnique:async({where}:{where:{externalId:string}})=>where.externalId==='existing'?{id:'P0'}:null,
      create:async({data}:{data:{amount:number;method:PaymentMethod;externalId?:string|null}})=>{paymentCreates++;order.payments.push({amount:data.amount});return{id:'P1',...data};},
    },
    order:{
      findUnique:async()=>({...order,payments:[...order.payments]}),
      update:async({data}:{data:{status:OrderStatus}})=>{orderUpdates++;order={...order,...data};return order;},
    },
    stockLocation:{updateMany:async()=>{stockCalls++;return{count:1};}},
  };
  const prisma={
    $transaction:async(fn:(client:typeof tx)=>Promise<unknown>)=>fn(tx),
  };
  const service=new OrdersService(prisma as never);
  process.env.STRIPE_WEBHOOK_SECRET='whsec_test';
  const stripe=require('../src/stripe');
  const original=stripe.getStripeClient;
  stripe.getStripeClient=()=>({webhooks:{constructEvent:()=>({type:'checkout.session.completed',data:{object:{id:'cs_test',metadata:{orderId:'O1'},payment_status:'paid',currency:'vnd',amount_total:100,payment_intent:'pi_1'}}})}});
  try {
    const result=await service.handleStripeWebhook(Buffer.from('{}'),'sig');
    assert.deepEqual(result,{received:true});
    assert.equal(paymentCreates,1,'Stripe must create one ledger payment');
    assert.equal(orderUpdates,1,'fully paid order must become PAID');
    assert.equal(stockCalls,0,'payment webhook must never mutate inventory');
    assert.equal(order.status,OrderStatus.PAID);
  } finally { stripe.getStripeClient=original; }

  order={id:'O2',stripeSessionId:null,status:OrderStatus.PENDING,totalAmount:100,payments:[{amount:40}]};
  const offlineTx={
    order:{findUnique:async()=>({...order,payments:[...order.payments]}),update:async({data}:{data:{status:OrderStatus}})=>{order={...order,...data};return order;}},
    orderPayment:{create:async({data}:{data:{amount:number}})=>({id:'P2',...data})},
  };
  const offline=new OrdersService({$transaction:async(fn:(client:typeof offlineTx)=>Promise<unknown>)=>fn(offlineTx)} as never);
  await assert.rejects(()=>offline.recordPayment('O2',{amount:61,method:PaymentMethod.CASH},'U1'),BadRequestException);
  const partial=await offline.recordPayment('O2',{amount:30,method:PaymentMethod.BANK_TRANSFER},'U1');
  assert.equal(partial.paidAmount,70);
  assert.equal(partial.balance,30);
  assert.equal(partial.status,OrderStatus.PENDING);
  console.log('payment ledger/Stripe ownership critical regression tests passed');
}
main().catch((error:unknown)=>{console.error(error);process.exit(1);});
