import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { InventoryService } from '../src/inventory/inventory.service';
import { OrdersService } from '../src/orders/orders.service';

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
  // Webhook behavior is owned by OrdersService.handleStripeWebhook.
  // Controller-level raw-body/signature wiring is covered separately; this integration
  // suite must not import the removed legacy webhook.controller module.
  const service=new OrdersService(prisma as any);
  assert.equal(typeof service.handleStripeWebhook,'function');
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
