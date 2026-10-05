import { BadRequestException, Injectable } from '@nestjs/common';
import { SalesQuoteStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type QuoteItemInput={productId?:string;description:string;quantity:number;unitPrice:number};
export type CreateSalesQuoteInput={leadId?:string;clientId?:string;customerName:string;phone:string;company?:string;discount?:number;note?:string;validUntil?:string;items:QuoteItemInput[]};

@Injectable()
export class SalesQuotesService {
 constructor(private prisma:PrismaService){}
 findAll(){return this.prisma.salesQuote.findMany({orderBy:{createdAt:'desc'},include:{lead:{select:{id:true,name:true,status:true}},client:{select:{id:true,name:true}},order:{select:{id:true,code:true,status:true}},createdBy:{select:{id:true,email:true}},items:{include:{product:{select:{id:true,sku:true,name:true}}}}}})}
 async create(input:CreateSalesQuoteInput,userId:string){
  if(!input.items?.length)throw new BadRequestException('Báo giá cần ít nhất một dòng sản phẩm.');
  if(input.leadId){const lead=await this.prisma.quoteLead.findUnique({where:{id:input.leadId},select:{id:true}});if(!lead)throw new BadRequestException('Lead không hợp lệ.');}
  if(input.clientId){const client=await this.prisma.client.findUnique({where:{id:input.clientId},select:{id:true}});if(!client)throw new BadRequestException('Khách hàng không hợp lệ.');}
  const productIds=[...new Set(input.items.map(x=>x.productId).filter((x):x is string=>!!x))];if(productIds.length){const count=await this.prisma.product.count({where:{id:{in:productIds}}});if(count!==productIds.length)throw new BadRequestException('Sản phẩm trong báo giá không hợp lệ.');}
  const items=input.items.map(item=>{if(!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>10000||!Number.isFinite(item.unitPrice)||item.unitPrice<0)throw new BadRequestException('Dòng báo giá không hợp lệ.');return {...item,description:item.description.trim(),lineTotal:item.quantity*item.unitPrice}});
  if(items.some(x=>!x.description))throw new BadRequestException('Mô tả sản phẩm không được trống.');
  const subtotal=items.reduce((sum,x)=>sum+x.lineTotal,0);const discount=input.discount??0;if(!Number.isFinite(discount)||discount<0||discount>subtotal)throw new BadRequestException('Chiết khấu không hợp lệ.');
  const validUntil=input.validUntil?new Date(input.validUntil):null;if(input.validUntil&&Number.isNaN(validUntil!.getTime()))throw new BadRequestException('Hạn báo giá không hợp lệ.');if(validUntil&&validUntil<=new Date())throw new BadRequestException('Hạn báo giá phải ở tương lai.');
  if(!input.customerName.trim()||!input.phone.trim())throw new BadRequestException('Tên khách hàng và số điện thoại là bắt buộc.');
  const code=`BG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  return this.prisma.salesQuote.create({data:{code,leadId:input.leadId,clientId:input.clientId,createdById:userId,customerName:input.customerName.trim(),phone:input.phone.trim(),company:input.company?.trim(),subtotal,discount,total:subtotal-discount,note:input.note?.trim(),validUntil,items:{create:items}},include:{items:{include:{product:{select:{id:true,sku:true,name:true}}}},lead:true}});
 }
 async convertToOrder(id:string,clientId:string,locations:{itemId:string;locationId:string}[]){
  return this.prisma.$transaction(async tx=>{
   const quote=await tx.salesQuote.findUnique({where:{id},include:{items:true}});
   if(!quote)throw new BadRequestException('Không tìm thấy báo giá.');
   if(quote.status!==SalesQuoteStatus.ACCEPTED)throw new BadRequestException('Chỉ báo giá đã chấp nhận mới có thể tạo đơn hàng.');
   if(quote.orderId)throw new BadRequestException('Báo giá đã được chuyển thành đơn hàng.');
   const client=await tx.client.findUnique({where:{id:clientId},select:{id:true}});if(!client)throw new BadRequestException('Khách hàng không hợp lệ.');
   if(quote.items.some(item=>!item.productId))throw new BadRequestException('Báo giá có dòng nhập thủ công; cần gắn sản phẩm trước khi tạo đơn hàng.');
   const locationMap=new Map(locations.map(x=>[x.itemId,x.locationId]));if(locationMap.size!==quote.items.length)throw new BadRequestException('Cần chọn vị trí kho cho từng dòng báo giá.');
   const orderItems=[] as {productId:string;locationId:string;quantity:number;price:number}[];
   for(const item of quote.items){const locationId=locationMap.get(item.id);if(!locationId)throw new BadRequestException('Thiếu vị trí kho cho dòng báo giá.');
    const stock=await tx.stockLocation.findFirst({where:{locationId,productId:item.productId!},select:{quantity:true}});if(!stock||stock.quantity<item.quantity)throw new BadRequestException(`Không đủ tồn kho cho ${item.description} tại vị trí đã chọn.`);
    orderItems.push({productId:item.productId!,locationId,quantity:item.quantity,price:item.unitPrice});
   }
   const order=await tx.order.create({data:{clientId,totalAmount:quote.total,status:'PENDING',items:{create:orderItems}},include:{items:true}});
   await tx.salesQuote.update({where:{id},data:{clientId,orderId:order.id,convertedAt:new Date()}});
   return order;
  });
 }
 async updateStatus(id:string,status:SalesQuoteStatus,userId:string){
  return this.prisma.$transaction(async tx=>{const current=await tx.salesQuote.findUnique({where:{id},select:{leadId:true,status:true,validUntil:true}});if(!current)throw new BadRequestException('Không tìm thấy báo giá.');
   if(current.status===status)return tx.salesQuote.findUniqueOrThrow({where:{id}});
   const transitions:Record<SalesQuoteStatus,readonly SalesQuoteStatus[]>={DRAFT:[SalesQuoteStatus.SENT],SENT:[SalesQuoteStatus.ACCEPTED,SalesQuoteStatus.REJECTED,SalesQuoteStatus.EXPIRED],ACCEPTED:[],REJECTED:[],EXPIRED:[]};
   if(!transitions[current.status].includes(status))throw new BadRequestException(`Không thể chuyển báo giá từ ${current.status} sang ${status}.`);
   const now=new Date();if(status===SalesQuoteStatus.SENT&&current.validUntil&&current.validUntil<=now)throw new BadRequestException('Báo giá đã hết hạn, không thể gửi.');
   const quote=await tx.salesQuote.update({where:{id},data:{status,...(status===SalesQuoteStatus.SENT?{sentAt:now}:{}),...(status===SalesQuoteStatus.ACCEPTED?{acceptedAt:now}:{})}});
   if(current.leadId&&(status===SalesQuoteStatus.SENT||status===SalesQuoteStatus.ACCEPTED)){const leadStatus=status===SalesQuoteStatus.ACCEPTED?'WON':'QUOTED';await tx.quoteLead.update({where:{id:current.leadId},data:{status:leadStatus}});await tx.quoteLeadActivity.create({data:{leadId:current.leadId,userId,type:'QUOTE',content:`Báo giá ${quote.code}: ${status}`}});}
   return quote;
  });
 }
}
