import assert from 'node:assert/strict';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryService } from '../src/inventory/inventory.service';

async function main() {
  const updates:any[]=[]; const txCalls:any[]=[];
  const prisma:any={
    inventoryTransaction:{ findUnique: async ({where}:any) => where.id==='missing'?null:{id:where.id,type:where.id==='receipt'?'IMPORT':'EXPORT',details: where.id==='receipt'?[{locationId:'L1',productId:'P1',wheelRimId:null,quantity:2}]:[{locationId:'L1',productId:'P1',wheelRimId:null,quantity:3}]} },
    stockLocation:{
      findFirst: async ({where}:any)=> where.wheelRimId ? {id:'rim-stock',quantity:5}:{id:'product-stock',quantity:5},
      update: (args:any)=>{updates.push(args);return Promise.resolve(args);},
      create: async (args:any)=>args
    },
    assemblyLog:{create:(args:any)=>Promise.resolve(args)},
    $transaction: async (ops:any[])=>{txCalls.push(ops);return Promise.all(ops)}
  };
  const service=new InventoryService(prisma);
  (service as any).findReceiptById=async(id:string)=>({id});
  (service as any).findIssueById=async(id:string)=>({id});

  await assert.rejects(()=>service.confirmReceipt('missing'),NotFoundException);
  await service.confirmReceipt('receipt');
  assert.deepEqual(updates.at(-1).data,{quantity:{increment:2}});

  await service.confirmIssue('issue');
  assert.deepEqual(updates.at(-1).data,{quantity:{decrement:3}});

  prisma.stockLocation.findFirst=async()=>({id:'stock',quantity:1});
  await assert.rejects(()=>service.confirmIssue('issue'),BadRequestException);

  await assert.rejects(()=>service.assembleInventory('P','R',0,10,'L','U'),BadRequestException);
  prisma.stockLocation.findFirst=async({where}:any)=>where.productId?{id:'p',quantity:5}:{id:'r',quantity:5};
  const result=await service.assembleInventory('P','R',2,10,'L','U');
  assert.equal(result.quantity,2);
  assert.equal(txCalls.length,1,'assembly stock deductions and log must use one transaction');
  assert.equal(txCalls[0].length,3);
  console.log('inventory critical regression tests passed');
}
main().catch((e)=>{console.error(e);process.exit(1);});
