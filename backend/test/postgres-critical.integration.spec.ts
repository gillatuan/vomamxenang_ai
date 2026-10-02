import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { InventoryService } from '../src/inventory/inventory.service';
import { OrdersWebhookController } from '../src/orders/webhook.controller';

const prisma = new PrismaClient();
const uid = () => `p2-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const response = () => {
  const r:any={statusCode:200,body:null};
  r.status=(n:number)=>{r.statusCode=n;return r};
  r.json=(x:any)=>{r.body=x;return r};
  return r;
};

async function fixture() {
  const key=uid();
  const warehouse=await prisma.warehouse.create({data:{code:`W-${key}`,name:'Phase2 QA'}});
  const location=await prisma.location.create({data:{warehouseId:warehouse.id,zone:'Z',rack:'R',slot:'S',locationCode:`L-${key}`}});
  const product=await prisma.product.create({data:{sku:`SKU-${key}`,name:'Phase2 product',importPrice:100}});
  const stock=await prisma.stockLocation.create({data:{locationId:location.id,productId:product.id,quantity:5}});
  const client=await prisma.client.create({data:{name:'Phase2 client',email:`${key}@example.test`,phone:'000'}});
  return {key,warehouse,location,product,stock,client};
}

async function cleanup(f:any) {
  await prisma.orderItem.deleteMany({where:{productId:f.product.id}});
  await prisma.order.deleteMany({where:{clientId:f.client.id}});
  await prisma.transactionDetail.deleteMany({where:{productId:f.product.id}});
  await prisma.inventoryTransaction.deleteMany({where:{code:{startsWith:`TX-${f.key}`}}});
  await prisma.stockLocation.deleteMany({where:{productId:f.product.id}});
  await prisma.client.delete({where:{id:f.client.id}}).catch(()=>{});
  await prisma.product.delete({where:{id:f.product.id}}).catch(()=>{});
  await prisma.location.delete({where:{id:f.location.id}}).catch(()=>{});
  await prisma.warehouse.delete({where:{id:f.warehouse.id}}).catch(()=>{});
}

async function inventoryAggregateSafety() {
  const f=await fixture();
  try {
    const tx=await prisma.inventoryTransaction.create({
      data:{
        code:`TX-${f.key}-ISSUE`,type:'EXPORT',userId:'phase2',
        details:{create:[
          {productId:f.product.id,locationId:f.location.id,quantity:3,price:0},
          {productId:f.product.id,locationId:f.location.id,quantity:3,price:0},
        ]}
      }
    });
    const service=new InventoryService(prisma as any);
    await assert.rejects(()=>service.confirmIssue(tx.id),BadRequestException);
    const persisted=await prisma.stockLocation.findUnique({where:{id:f.stock.id}});
    assert.equal(persisted?.quantity,5,'failed aggregate issue must leave persisted stock unchanged');
  } finally { await cleanup(f); }
}

async function webhookSafety() {
  const f=await fixture();
  try {
    const order=await prisma.order.create({
      data:{
        clientId:f.client.id,totalAmount:600,status:'PENDING',stripeSessionId:`cs-${f.key}`,
        items:{create:[
          {productId:f.product.id,locationId:f.location.id,quantity:3,price:100},
          {productId:f.product.id,locationId:f.location.id,quantity:3,price:100},
        ]}
      }
    });
    const event={type:'checkout.session.completed',data:{object:{id:`cs-${f.key}`}}};
    const controller=new OrdersWebhookController(prisma as any);
    (controller as any).getStripeClientForWebhook=()=>({webhooks:{constructEvent:()=>event}});
    const req:any={headers:{'stripe-signature':'phase2'},rawBody:Buffer.from('{}')};
    const res=response();
    await controller.handle(req,res);
    assert.equal(res.statusCode,409,'aggregate insufficient stock must reject fulfillment');
    const [persistedStock,persistedOrder]=await Promise.all([
      prisma.stockLocation.findUnique({where:{id:f.stock.id}}),
      prisma.order.findUnique({where:{id:order.id}}),
    ]);
    assert.equal(persistedStock?.quantity,5,'failed fulfillment must not mutate persisted stock');
    assert.equal(persistedOrder?.status,'PENDING','failed fulfillment must not mark order PAID');

    await prisma.orderItem.deleteMany({where:{orderId:order.id}});
    await prisma.order.delete({where:{id:order.id}});
    await prisma.stockLocation.update({where:{id:f.stock.id},data:{quantity:5}});
    const safeOrder=await prisma.order.create({
      data:{clientId:f.client.id,totalAmount:200,status:'PENDING',stripeSessionId:`cs-safe-${f.key}`,
        items:{create:{productId:f.product.id,locationId:f.location.id,quantity:2,price:100}}}
    });
    const safeEvent={type:'checkout.session.completed',data:{object:{id:`cs-safe-${f.key}`}}};
    (controller as any).getStripeClientForWebhook=()=>({webhooks:{constructEvent:()=>safeEvent}});
    await Promise.all([controller.handle(req,response()),controller.handle(req,response())]);
    const [stockAfter,orderAfter]=await Promise.all([
      prisma.stockLocation.findUnique({where:{id:f.stock.id}}),
      prisma.order.findUnique({where:{id:safeOrder.id}}),
    ]);
    assert.equal(stockAfter?.quantity,3,'concurrent duplicate webhook must decrement persisted stock exactly once');
    assert.equal(orderAfter?.status,'PAID');
  } finally { await cleanup(f); }
}

async function main(){
  await prisma.$connect();
  try {
    await inventoryAggregateSafety();
    await webhookSafety();
    console.log('PostgreSQL critical integration tests passed');
  } finally { await prisma.$disconnect(); }
}
main().catch(e=>{console.error(e);process.exit(1);});
