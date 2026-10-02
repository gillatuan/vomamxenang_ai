import assert from 'node:assert/strict';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryService } from '../src/inventory/inventory.service';

async function main() {
  const updates:any[]=[]; const txCalls:any[]=[];
  const detailsById:any={
    receipt:[{locationId:'L1',productId:'P1',wheelRimId:null,quantity:2}],
    issue:[{locationId:'L1',productId:'P1',wheelRimId:null,quantity:3}],
    'multi-receipt':[
      {locationId:'L1',productId:'P1',wheelRimId:null,quantity:2},
      {locationId:'',productId:'P2',wheelRimId:null,quantity:1},
    ],
    'multi-issue':[
      {locationId:'L1',productId:'P1',wheelRimId:null,quantity:2},
      {locationId:'L2',productId:'P2',wheelRimId:null,quantity:10},
    ],
  };
  const prisma:any={
    inventoryTransaction:{ findUnique: async ({where}:any) => where.id==='missing'?null:{id:where.id,type:where.id.includes('receipt')?'IMPORT':'EXPORT',details:detailsById[where.id]} },
    stockLocation:{
      findFirst: async ({where}:any)=> where.productId==='P2'?{id:'stock-p2',quantity:1}:{id:'stock-p1',quantity:5},
      update: (args:any)=>{updates.push(args);return Promise.resolve(args);},
      updateMany: async (args:any)=>{updates.push(args); const available=args.where.id==='stock-p2'?1:5; return {count: available >= args.where.quantity.gte ? 1 : 0};},
      create: async (args:any)=>args
    },
    assemblyLog:{create:(args:any)=>Promise.resolve(args)},
    $transaction: async (arg:any)=>{
      txCalls.push(arg);
      if(typeof arg==='function') return arg(prisma);
      return Promise.all(arg);
    }
  };
  const service=new InventoryService(prisma);
  (service as any).findReceiptById=async(id:string)=>({id});
  (service as any).findIssueById=async(id:string)=>({id});

  await assert.rejects(()=>service.confirmReceipt('missing'),NotFoundException);
  await service.confirmReceipt('receipt');
  assert.deepEqual(updates.at(-1).data,{quantity:{increment:2}});
  await service.confirmIssue('issue');
  assert.deepEqual(updates.at(-1).data,{quantity:{decrement:3}});

  updates.length=0; txCalls.length=0;
  await assert.rejects(()=>service.confirmReceipt('multi-receipt'),BadRequestException);
  assert.equal(txCalls.length,1,'multi-line receipt confirmation must execute in one transaction');

  updates.length=0; txCalls.length=0;
  await assert.rejects(()=>service.confirmIssue('multi-issue'),BadRequestException);
  assert.equal(txCalls.length,1,'multi-line issue confirmation must execute in one transaction');

  await assert.rejects(()=>service.assembleInventory('P','R',0,10,'L','U'),BadRequestException);
  prisma.stockLocation.findFirst=async({where}:any)=>where.productId?{id:'p',quantity:5}:{id:'r',quantity:5};
  const result=await service.assembleInventory('P','R',2,10,'L','U');
  assert.equal(result.quantity,2);
  console.log('inventory critical regression tests passed');
}
main().catch((e)=>{console.error(e);process.exit(1);});
