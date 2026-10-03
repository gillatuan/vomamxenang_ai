import { PrismaClient } from '@prisma/client';

const prisma=new PrismaClient();
const apply=process.argv.includes('--apply');
const weak=(v?:string|null)=>!v||v.trim().length<80;
const clean=(v?:string|null)=>(v||'').trim();
function tireLabel(v?:string|null,name=''){
  const x=(v+' '+name).toLowerCase();
  if(/non.?mark|trắng|white/.test(x))return 'lốp đặc không để lại vệt';
  if(/pneu|hơi/.test(x))return 'lốp hơi xe nâng';
  if(/solid|đặc/.test(x))return 'lốp đặc xe nâng';
  return 'vỏ xe nâng';
}
function content(p:any){
  const kind=tireLabel(p.tireType,p.name), size=p.size?` kích thước ${p.size}`:'', brand=p.brand?` ${p.brand}`:'';
  const state=p.condition==='USED'?'đã qua sử dụng, cần kiểm tra độ mòn và tình trạng thực tế trước khi lắp':'hàng mới';
  const short=`${kind.charAt(0).toUpperCase()+kind.slice(1)}${brand}${size}, ${state}. Dùng để đối chiếu cho xe nâng theo đúng thông số lốp, cấu hình mâm, tải trọng và môi trường vận hành.`;
  const description=`<p><strong>${p.name}</strong> là ${kind}${size}${p.brand?` của ${p.brand}`:''}. Sản phẩm phù hợp để đối chiếu khi thay vỏ cho xe nâng trong kho, xưởng hoặc khu vực vận hành tương ứng với loại lốp.</p><p>Khi chọn lốp cần kiểm tra đồng thời kích thước đang dùng, loại mâm, tải trọng xe và tải thực tế, bề mặt nền, quãng đường di chuyển và tần suất làm việc. Không nên chọn chỉ dựa trên tên xe hoặc đường kính bánh.</p><p>Võ Mâm Xe Nâng hỗ trợ kiểm tra thông số, tư vấn loại vỏ/mâm phù hợp, xác nhận tồn kho và báo giá trước khi giao hoặc ép lắp.</p>`;
  const highlights=[`Thông số ${p.size||'theo cấu hình thực tế'} cần được đối chiếu trước khi lắp`,`Loại: ${kind}`,p.brand?`Thương hiệu: ${p.brand}`:'Tư vấn theo nhu cầu vận hành'].filter(Boolean);
  const applications=[/non.?mark|trắng|white/i.test((p.tireType||'')+' '+p.name)?'Kho/xưởng ưu tiên hạn chế vệt lốp trên nền':'Xe nâng kho xưởng và ứng dụng vật liệu phù hợp với loại lốp','Thay thế theo đúng kích thước và cấu hình mâm hiện hữu'];
  const primary=[kind,p.size].filter(Boolean).join(' ');
  const seo={...(p.seo||{}),title:`${p.name}${p.size&&!p.name.includes(p.size)?` ${p.size}`:''} | Võ Mâm Xe Nâng`.slice(0,60),description:`${short} Liên hệ kiểm tra tồn kho và báo giá.`.slice(0,155),primaryKeyword:primary,keywords:Array.from(new Set([primary,`${kind} ${p.size||''}`.trim(),p.brand?`${kind} ${p.brand}`:null,'vỏ xe nâng'].filter(Boolean))),imageAlt:`${p.name}${p.size?` ${p.size}`:''} - Võ Mâm Xe Nâng`};
  return {shortDescription:short,description,highlights,specifications:[p.size?{label:'Kích thước',value:p.size}:null,p.brand?{label:'Thương hiệu',value:p.brand}:null,p.tireType?{label:'Loại lốp',value:p.tireType}:null].filter(Boolean),applications,seo,tags:Array.from(new Set([...(p.tags||[]),kind,p.size,p.brand].filter(Boolean)))};
}
async function main(){
 const products=await prisma.product.findMany({where:{status:'PUBLISHED'},orderBy:{createdAt:'asc'}});
 let changed=0;
 for(const p of products){
  const next=content(p); const data:any={};
  if(weak(p.shortDescription))data.shortDescription=next.shortDescription;
  if(weak(p.description))data.description=next.description;
  if(!Array.isArray(p.highlights)||(p.highlights as any[]).length===0)data.highlights=next.highlights;
  if(!Array.isArray(p.specifications)||(p.specifications as any[]).length===0)data.specifications=next.specifications;
  if(!Array.isArray(p.applications)||(p.applications as any[]).length===0)data.applications=next.applications;
  const seo=(p.seo||{}) as any;if(!seo.title||!seo.description||!seo.primaryKeyword)data.seo={...seo,...next.seo};
  if(!p.tags.length)data.tags=next.tags;
  if(!Object.keys(data).length)continue;changed++;
  console.log(JSON.stringify({sku:p.sku,name:p.name,fields:Object.keys(data)}));
  if(apply)await prisma.product.update({where:{id:p.id},data});
 }
 console.log(JSON.stringify({mode:apply?'apply':'dry-run',products:products.length,changed}));
}
main().finally(()=>prisma.$disconnect());
