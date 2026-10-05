import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversionAnalyticsService {
  constructor(private p: PrismaService) {}

  async create(d:{type:any;path:string;productId?:string;context?:string;sessionId?:string}) {
    if(d.productId){const exists=await this.p.product.findUnique({where:{id:d.productId},select:{id:true}});if(!exists)d.productId=undefined}
    return this.p.conversionEvent.create({data:d,select:{id:true}});
  }

  async report() {
    const now = new Date();
    const since30d = new Date(now.getTime() - 30 * 86400000);
    const [events, leads, top, totalLeads, recentLeads, overdue, unassigned, assigneeRows, sourceRows, landingRows, productRows] = await Promise.all([
      this.p.conversionEvent.groupBy({by:['type'],_count:{_all:true}}),
      this.p.quoteLead.groupBy({by:['status'],_count:{_all:true}}),
      this.p.conversionEvent.groupBy({by:['path'],_count:{_all:true},orderBy:{_count:{path:'desc'}},take:10}),
      this.p.quoteLead.count(),
      this.p.quoteLead.count({where:{createdAt:{gte:since30d}}}),
      this.p.quoteLead.count({where:{followUpAt:{lt:now},status:{notIn:['WON','LOST']}}}),
      this.p.quoteLead.count({where:{assigneeId:null,status:{notIn:['WON','LOST']}}}),
      this.p.quoteLead.groupBy({by:['assigneeId','status'],_count:{_all:true}}),
      this.p.quoteLead.groupBy({by:['source'],_count:{_all:true},orderBy:{_count:{source:'desc'}},take:10}),
      this.p.quoteLead.groupBy({by:['landingPage'],where:{landingPage:{not:null}},_count:{_all:true},orderBy:{_count:{landingPage:'desc'}},take:10}),
      this.p.quoteLead.groupBy({by:['productId'],where:{productId:{not:null}},_count:{_all:true},orderBy:{_count:{productId:'desc'}},take:10}),
    ]);
    const assigneeIds=[...new Set(assigneeRows.map(x=>x.assigneeId).filter((x):x is string=>!!x))];
    const productIds=productRows.map(x=>x.productId).filter((x):x is string=>!!x);
    const [users,products]=await Promise.all([
      assigneeIds.length?this.p.user.findMany({where:{id:{in:assigneeIds}},select:{id:true,email:true}}):[],
      productIds.length?this.p.product.findMany({where:{id:{in:productIds}},select:{id:true,name:true,sku:true,slug:true}}):[],
    ]);
    const userMap=new Map(users.map(x=>[x.id,x.email]));
    const productMap=new Map(products.map(x=>[x.id,x]));
    const byAssignee=new Map<string,{assigneeId:string|null;email:string;total:number;won:number;open:number}>();
    for(const row of assigneeRows){
      const key=row.assigneeId||'UNASSIGNED'; const current=byAssignee.get(key)||{assigneeId:row.assigneeId,email:row.assigneeId?userMap.get(row.assigneeId)||'Không xác định':'Chưa giao',total:0,won:0,open:0};
      current.total+=row._count._all;if(row.status==='WON')current.won+=row._count._all;if(row.status!=='WON'&&row.status!=='LOST')current.open+=row._count._all;byAssignee.set(key,current);
    }
    const won=leads.find(x=>x.status==='WON')?._count._all||0;
    const lost=leads.find(x=>x.status==='LOST')?._count._all||0;
    return {
      events:Object.fromEntries(events.map(x=>[x.type,x._count._all])),
      leads:Object.fromEntries(leads.map(x=>[x.status,x._count._all])),
      topPaths:top.map(x=>({path:x.path,count:x._count._all})),
      sales:{totalLeads,recentLeads,overdue,unassigned,won,lost,winRate:won+lost?Math.round(won/(won+lost)*1000)/10:0},
      byAssignee:[...byAssignee.values()].sort((a,b)=>b.total-a.total),
      topSources:sourceRows.map(x=>({source:x.source,count:x._count._all})),
      topLandingPages:landingRows.map(x=>({path:x.landingPage!,count:x._count._all})),
      topProducts:productRows.map(x=>({product:productMap.get(x.productId!)||null,count:x._count._all})).filter(x=>x.product),
    };
  }
}
