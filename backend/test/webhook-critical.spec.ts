import assert from 'node:assert/strict';
import { OrdersWebhookController } from '../src/orders/webhook.controller';

const response=()=>{const r:any={statusCode:200,body:null};r.status=(n:number)=>{r.statusCode=n;return r};r.json=(x:any)=>{r.body=x;return r};return r;};

async function main(){
  const prisma:any={order:{findUnique:async()=>null,update:(x:any)=>Promise.resolve(x)},stockLocation:{updateMany:(x:any)=>Promise.resolve(x)},$transaction:async(x:any[])=>Promise.all(x)};
  const controller=new OrdersWebhookController(prisma);
  let res=response();
  await controller.handle({headers:{}} as any,res);
  assert.equal(res.statusCode,400);
  assert.equal(res.body.error,'Missing signature or raw body');
  console.log('stripe webhook signature regression test passed');
}
main().catch((e)=>{console.error(e);process.exit(1);});
