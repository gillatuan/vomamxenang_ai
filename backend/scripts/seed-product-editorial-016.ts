import { PrismaClient } from '@prisma/client';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { sep } from 'node:path';
import { editorialProducts016, editorialAllProductsSeed016 } from '../prisma/seeds/production/016-unique-product-editorial.seed';
import { runProductionSeeds } from '../prisma/seed-production-runner';

const mode=process.argv[2];
if(!['dry-run','apply'].includes(mode)) throw Error('Use dry-run or apply');
if(process.env.APP_ENV!=='production') throw Error('Production environment required');
const raw=process.env.DATABASE_URL;
if(!raw) throw Error('Missing direct database URL');
const url=new URL(raw);
if(!['postgres:','postgresql:'].includes(url.protocol) || !url.hostname || url.hostname.includes('accelerate.prisma-data.net'))
  throw Error('Direct PostgreSQL URL required');
const expected=process.env.EXPECTED_PRODUCTION_DATABASE_NAME?.trim();
if(mode==='apply' && (expected!=='postgres' || decodeURIComponent(url.pathname.slice(1))!==expected))
  throw Error('Database name mismatch or missing confirmation');
const prisma=new PrismaClient();

function requireVerifiedBackup() {
  if(process.env.CONFIRM_EDITORIAL_SEED!=='APPLY-EDITORIAL-016-PRODUCTION')
    throw Error('Explicit editorial apply confirmation required');
  const root=process.env.PRODUCTION_BACKUP_DIR, marker=process.env.RESTORE_VERIFIED_MARKER;
  if(!root || !marker)throw Error('Fresh isolated restore required');
  const dir=realpathSync(root),file=realpathSync(marker);
  if(!file.startsWith(dir+sep)||statSync(file).size>16384)throw Error('Invalid restore marker');
  const proof=JSON.parse(readFileSync(file,'utf8'));
  if(proof.restoreVerified!==true || !/^[0-9a-f]{64}$/i.test(proof.sha256??''))
    throw Error('Isolated restore verification failed');
  if(!['FULL_DATABASE','APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION'].includes(proof.restoreScope))
    throw Error('Invalid restore scope');
  if(proof.restoreScope==='APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION' &&
    (process.env.PRISMA_PROVIDER_APP_DATA_RESTORE!=='YES' ||
     proof.fullOriginalArchivePreserved!==true || !Number.isInteger(proof.excludedProviderEntries) ||
     proof.excludedProviderEntries<0)) throw Error('Invalid provider restore proof');
  const age=Date.now()-Date.parse(proof.verifiedAt);
  if(!Number.isFinite(age)||age< -60000 ||age>30*60000)throw Error('Stale restore proof');
  if(!/^[a-f0-9]{40}$/i.test(process.env.AUDITED_SHA??'')||proof.revision!==process.env.AUDITED_SHA)
    throw Error('Restore proof commit mismatch');
}
async function main(){
  const rows=await prisma.$queryRaw<Array<{name:string}>>`SELECT current_database()::text AS name`;
  if(rows.length!==1||rows[0].name!=='postgres')throw Error('Unexpected live database identity');
  const skus=editorialProducts016.map(e=>e.sku);
  const products=await prisma.product.findMany({
    where:{sku:{in:skus}},
    select:{sku:true,name:true,description:true,shortDescription:true,highlights:true,status:true,sellingPrice:true},
  });
  const all=await prisma.product.count();
  const existing=new Set(products.map(p=>p.sku));
  const applied=await prisma.seedHistory.findUnique({where:{key:editorialAllProductsSeed016.key}});
  const uncovered=await prisma.product.findMany({where:{sku:{notIn:skus}},select:{sku:true,name:true,type:true}});
  console.log(JSON.stringify({
    mode,database:rows[0].name,seed016Applied:!!applied,
    knownCatalog:skus.length,matchingExisting:products.length,
    outsideReviewedCatalog:all-products.length,
    matchingSKUs:products.map(p=>p.sku),
    missingReviewedSKUs:skus.filter(s=>!existing.has(s)),
    uncoveredProducts:uncovered.map(p=>({sku:p.sku,type:p.type})),
    willUpdateDescriptionsOnly:mode==='apply'&&!applied,
  },null,2));
  if(mode==='dry-run'){console.log('[EDITORIAL 016] READ-ONLY PREVIEW COMPLETE');return;}
  requireVerifiedBackup();
  if(uncovered.length)throw Error('Unreviewed production SKUs exist. Write individual descriptions for them before applying an ALL-products content release.');
  const result=await runProductionSeeds(prisma,[editorialAllProductsSeed016],false);
  const after=await prisma.product.findMany({where:{sku:{in:skus}},select:{sku:true,description:true,shortDescription:true,highlights:true}});
  const bySku=new Map(after.map(p=>[p.sku,p]));
  for(const p of editorialProducts016){
    const item=bySku.get(p.sku);
    if(!item)continue;
    if(!item.description?.includes(p.heading)||!item.description.includes('Đặc điểm và tính chất')||
      !item.description.includes('Kiểm tra trước khi lắp'))throw Error('Editorial post-seed verification failed for '+p.sku);
  }
  console.log(JSON.stringify({executed:result.executed,skipped:result.skipped,verified:after.length},null,2));
}
main().catch(err=>{console.error('[EDITORIAL 016] FAILED: '+(err instanceof Error?err.message:'Unknown error'));process.exitCode=1}).finally(()=>prisma.$disconnect());
