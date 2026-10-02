import assert from 'node:assert/strict';
import { OrdersWebhookController } from '../src/orders/webhook.controller';

const response=()=>{const r:any={statusCode:200,body:null};r.status=(n:number)=>{r.statusCode=n;return r};r.json=(x:any)=>{r.body=x;return r};return r;};

async function main(){
  const stripe:any={webhooks:{constructEvent:()=>({type:'checkout.session.completed',data:{object:{id:'cs_test'}}})}};
  let order:any={id:'O1',stripeSessionId:'cs_test',status:'PENDING',items:[{locationId:'L1',productId:'P1',wheelRimId:null,quantity:2}]};
  let stockQty=5; let decrements=0; let paidUpdates=0;
  const prisma:any={
    order:{
      findUnique:async()=>({...order,items:order.items.map((x:any)=>({...x}))}),
      update:async({data}:any)=>{paidUpdates++;order={...order,...data};return order;}
    },
    stockLocation:{
      findFirst:async()=>({id:'S1',quantity:stockQty}),
      update:async({data}:any)=>{stockQty-=data.quantity.decrement;decrements++;return{id:'S1',quantity:stockQty};},
      updateMany:async({data}:any)=>{if(stockQty<data.quantity.decrement)return{count:0};stockQty-=data.quantity.decrement;decrements++;return{count:1};}
    },
    $queryRawUnsafe:async()=>[{id:order.id}],
    $transaction:async(arg:any)=>typeof arg==='function'?arg(prisma):Promise.all(arg)
  };
  const controller=new OrdersWebhookController(prisma);
  (controller as any).getStripeClientForWebhook=()=>stripe;
  const req:any={headers:{'stripe-signature':'sig'},rawBody:Buffer.from('{}')};

  let res=response(); await controller.handle(req,res);
  assert.equal(res.statusCode,200); assert.equal(stockQty,3); assert.equal(decrements,1); assert.equal(paidUpdates,1);

  res=response(); await controller.handle(req,res);
  assert.equal(res.statusCode,200);
  assert.equal(stockQty,3,'duplicate Stripe delivery must not decrement stock twice');
  assert.equal(decrements,1,'duplicate Stripe delivery must be idempotent');

  // Simulate two concurrent deliveries that both observed PENDING before entering
  // the transaction. The row lock must make the second transaction re-check PAID.
  order={id:'O-concurrent',stripeSessionId:'cs_test',status:'PENDING',items:[{locationId:'L1',productId:'P1',wheelRimId:null,quantity:2}]};
  stockQty=5; decrements=0; paidUpdates=0;
  let releaseLock:()=>void=()=>{}; let lockHeld=false;
  const originalTx=prisma.$transaction;
  prisma.$transaction=async(fn:any)=>{
    while(lockHeld) await new Promise(r=>setTimeout(r,1));
    lockHeld=true;
    try { return await fn(prisma); } finally { lockHeld=false; releaseLock(); }
  };
  const concurrentReq=()=>controller.handle(req,response());
  await Promise.all([concurrentReq(),concurrentReq()]);
  assert.equal(stockQty,3,'concurrent duplicate deliveries must decrement stock once');
  assert.equal(decrements,1,'row lock + status re-check must serialize fulfillment');
  assert.equal(paidUpdates,1);
  prisma.$transaction=originalTx;

  order={id:'O2',stripeSessionId:'cs_test',status:'PENDING',items:[{locationId:'L1',productId:'P1',wheelRimId:null,quantity:4}]};
  stockQty=1; decrements=0; paidUpdates=0;
  res=response(); await controller.handle(req,res);
  assert.equal(res.statusCode,409,'insufficient stock must reject fulfillment');
  assert.equal(stockQty,1,'insufficient stock must not decrement inventory');
  assert.equal(paidUpdates,0,'order must not become PAID when stock cannot be fulfilled');
  console.log('stripe webhook idempotency/stock-safety regression tests passed');
}
main().catch((e)=>{console.error(e);process.exit(1);});
