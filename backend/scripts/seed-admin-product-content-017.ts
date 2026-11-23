import { PrismaClient } from '@prisma/client';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { sep } from 'node:path';
import { adminOwnedProductContentSeed017 } from '../prisma/seeds/production/017-admin-owned-product-content.seed';
import { runProductionSeeds } from '../prisma/seed-production-runner';

const mode=process.argv[2];
if(!['dry-run','apply'].includes(mode)) throw Error('Use dry-run or apply');
if(process.env.APP_ENV!=='production') throw Error('Production environment required');
const raw=process.env.DATABASE_URL;
if(!raw)throw Error('Missing direct database URL');
const url=new URL(raw);
if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||url.hostname.includes('accelerate.prisma-data.net'))
  throw Error('Direct PostgreSQL URL required');
const expected=process.env.EXPECTED_PRODUCTION_DATABASE_NAME?.trim();
if(mode==='apply'&&(expected!=='postgres'||decodeURIComponent(url.pathname.slice(1))!==expected))
  throw Error('Database identity mismatch or missing confirmation');
const prisma=new PrismaClient();
function requireVerifiedBackup(){
  if(process.env.CONFIRM_ADMIN_CONTENT_SEED!=='APPLY-ADMIN-CONTENT-017-PRODUCTION')
    throw Error('Explicit seed 017 confirmation required');
  const root=process.env.PRODUCTION_BACKUP_DIR,marker=process.env.RESTORE_VERIFIED_MARKER;
  if(!root||!marker)throw Error('Fresh isolated restore required');
  const dir=realpathSync(root),file=realpathSync(marker);
  if(!file.startsWith(dir+sep)||statSync(file).size>16384)throw Error('Invalid restore marker');
  const proof=JSON.parse(readFileSync(file,'utf8'));
  if(proof.restoreVerified!==true||!/^[0-9a-f]{64}$/i.test(proof.sha256??''))
    throw Error('Isolated restore verification failed');
  if(!['FULL_DATABASE','APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION'].includes(proof.restoreScope))
    throw Error('Invalid restore scope');
  if(proof.restoreScope==='APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION'&&(
    process.env.PRISMA_PROVIDER_APP_DATA_RESTORE!=='YES'||
    proof.fullOriginalArchivePreserved!==true||
    !Number.isInteger(proof.excludedProviderEntries)||proof.excludedProviderEntries<0))
    throw Error('Invalid provider restore proof');
  const age=Date.now()-Date.parse(proof.verifiedAt);
  if(!Number.isFinite(age)||age < -60000 ||age>30*60000)throw Error('Stale restore proof');
  if(!/^[a-f0-9]{40}$/i.test(process.env.AUDITED_SHA??'')||proof.revision!==process.env.AUDITED_SHA)
    throw Error('Restore proof commit mismatch');
}
async function main(){
  const identity=await prisma.$queryRaw<Array<{name:string}>>`SELECT current_database()::text AS name`;
  if(identity.length!==1||identity[0].name!=='postgres')throw Error('Unexpected database');
  const history=await prisma.seedHistory.findMany({
    where:{key:{in:['016-unique-product-editorial-content',adminOwnedProductContentSeed017.key]}},
    select:{key:true},
  });
  const keys=new Set(history.map(s=>s.key));
  if(!keys.has('016-unique-product-editorial-content'))throw Error('Editorial seed 016 must be applied first');
  console.log(JSON.stringify({mode,database:identity[0].name,seed016Applied:true,
    seed017Applied:keys.has(adminOwnedProductContentSeed017.key),
    note:'This release cleans recognizable legacy template fields; all product copy is edited in Admin.'
  },null,2));
  if(mode==='dry-run'){console.log('[ADMIN CONTENT 017] READ-ONLY PREVIEW COMPLETE');return;}
  requireVerifiedBackup();
  const result=await runProductionSeeds(prisma,[adminOwnedProductContentSeed017],false);
  if(!result.executed.includes(adminOwnedProductContentSeed017.key)&&!result.skipped.includes(adminOwnedProductContentSeed017.key))
    throw Error('Seed 017 release not recorded');
  const completed=await prisma.seedHistory.findUnique({where:{key:adminOwnedProductContentSeed017.key}});
  if(!completed)throw Error('Seed 017 history missing after apply');
  console.log(JSON.stringify({executed:result.executed,skipped:result.skipped,seedHistoryVerified:true},null,2));
}
main().catch(err=>{console.error('[ADMIN CONTENT 017] FAILED: '+(err instanceof Error?err.message:'Unknown error'));process.exitCode=1})
.finally(()=>prisma.$disconnect());
