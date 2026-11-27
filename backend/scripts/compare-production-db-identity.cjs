#!/usr/bin/env node
'use strict';
// Compares GitHub Production direct DB and actual Vercel backend Production DATABASE_URL.
// Reads catalog metadata only. Never logs or exports connection strings or credentials.
const { PrismaClient } = require('@prisma/client');
const crypto = require('node:crypto');

const keys = ['QuoteLead','CaseStudy','ConversionEvent','SalesQuote','OrderPayment','Product','_prisma_migrations'];
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
function endpoint(url) {
  const u=new URL(url);
  if(!['postgres:', 'postgresql:', 'prisma:', 'prisma+postgres:'].includes(u.protocol)) throw Error('Unsupported DB protocol');
  return [u.protocol,u.hostname.toLowerCase(),u.port,decodeURIComponent(u.pathname),u.searchParams.get('schema')||'public'].join('|');
}
async function vercelDatabaseUrl() {
  const token=process.env.VERCEL_TOKEN;
  const team=process.env.VERCEL_ORG_ID;
  const project=process.env.VERCEL_BACKEND_PROJECT_ID;
  if(!token||!team||!project)throw Error('Vercel deploy credentials unavailable in Production environment');
  // One explicit project selected by the same VERCEL_BACKEND_PROJECT_ID used to deploy production.
  const url='https://api.vercel.com/v9/projects/'+encodeURIComponent(project)+
    '/env?teamId='+encodeURIComponent(team)+'&decrypt=true';
  const res=await fetch(url,{headers:{Authorization:'Bearer '+token},
    signal:AbortSignal.timeout(20000)});
  if(!res.ok)throw Error('Vercel production env read denied or unavailable (HTTP '+res.status+')');
  const body=await res.json();
  const values=(body.envs||[]).filter(e=>e.key==='DATABASE_URL' &&
    (Array.isArray(e.target)?e.target.includes('production'):e.target==='production') &&
    !e.gitBranch);
  if(values.length!==1)throw Error('Expected one unambiguous Vercel production DATABASE_URL; found '+values.length);
  const value=values[0].value;
  if(typeof value!=='string'||!value||value==='*****'||value.includes('REDACTED')) {
    throw Error('Vercel DATABASE_URL value is not decryptable with current token');
  }
  return value;
}
async function snapshot(url) {
  const prisma=new PrismaClient({datasources:{db:{url}}});
  try {
    return await prisma.$transaction(async tx=>{
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
      await tx.$executeRawUnsafe("SET LOCAL statement_timeout='20000ms'");
      const ident=await tx.$queryRawUnsafe(
        "SELECT current_database() AS db, current_schema() AS schema, pg_is_in_recovery() AS is_replica");
      const present=await tx.$queryRawUnsafe(
        "SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p') AND relname IN ('QuoteLead','CaseStudy','ConversionEvent','SalesQuote','OrderPayment','Product','_prisma_migrations') ORDER BY relname");
      const names=present.map(x=>x.relname);
      if(!names.includes('Product')||!names.includes('_prisma_migrations'))throw Error('Expected Product and history tables absent');
      const products=await tx.$queryRawUnsafe(
        'SELECT count(*)::int AS total, md5(coalesce(string_agg("id"::text, \',\' ORDER BY "id"),\'\')) AS ids_digest FROM public."Product"');
      const migrations=await tx.$queryRawUnsafe(
        "SELECT md5(coalesce(string_agg(migration_name||':'||checksum||':'||(finished_at IS NOT NULL)::text||':'||(rolled_back_at IS NOT NULL)::text,',' ORDER BY migration_name),'')) AS ledger_digest,count(*)::int AS total FROM public.\"_prisma_migrations\"");
      return {
        database:ident[0].db,schema:ident[0].schema,isReplica:ident[0].is_replica,
        objects:keys.map(name=>({name,present:names.includes(name)})),
        productCount:products[0].total,
        productIdsDigest:products[0].ids_digest,
        migrationCount:migrations[0].total,
        migrationLedgerDigest:migrations[0].ledger_digest,
      };
    },{timeout:45000,maxWait:20000});
  } finally {await prisma.$disconnect();}
}
async function main(){
  if(process.env.APP_ENV!=='production')throw Error('Production environment required');
  const github=process.env.GITHUB_DIRECT_DATABASE_URL;
  if(!github)throw Error('Missing GitHub DIRECT_DATABASE_URL');
  const vercel=await vercelDatabaseUrl();
  let githubResult,vercelResult;
  try {githubResult=await snapshot(github);}catch(e){throw Error('GitHub DB read-only probe failed');}
  try {vercelResult=await snapshot(vercel);}catch(e){throw Error('Vercel DB read-only probe failed');}
  const sameEndpoint=endpoint(github)===endpoint(vercel);
  const sameSchemaSignature=
    githubResult.database===vercelResult.database &&
    githubResult.schema===vercelResult.schema &&
    JSON.stringify(githubResult.objects)===JSON.stringify(vercelResult.objects) &&
    githubResult.productCount===vercelResult.productCount &&
    githubResult.productIdsDigest===vercelResult.productIdsDigest &&
    githubResult.migrationCount===vercelResult.migrationCount &&
    githubResult.migrationLedgerDigest===vercelResult.migrationLedgerDigest;
  const verdict=sameEndpoint && sameSchemaSignature?'MATCHING_ENDPOINT_AND_SCHEMA_SNAPSHOT':
    sameSchemaSignature?'MATCHING_SCHEMA_SNAPSHOT_ENDPOINTS_DIFFER':
    'DIFFERENT_SCHEMA_STATE__STOP_MIGRATIONS';
  const safe=(x)=>({
    database:x.database,schema:x.schema,isReplica:x.isReplica,objects:x.objects,
    productCount:x.productCount,migrationCount:x.migrationCount,
  });
  console.log(JSON.stringify({mode:'READ_ONLY',verdict,sameEndpoint,sameSchemaSignature,
    github: safe(githubResult),vercelBackend:safe(vercelResult),
    disclaimer:'Matching snapshots alone do not prove identical physical database instance. Never run migration based solely on this report.'},null,2));
  if(!sameEndpoint || !sameSchemaSignature)process.exitCode=1;
}
main().catch(e=>{
  // Never print raw errors: Prisma or Vercel APIs may echo connection URL.
  const safe=/^Vercel production env read denied|^Vercel DATABASE_URL|^Expected one unambiguous|^Vercel deploy credentials|^Missing GitHub|^Production environment|^Expected Product|^GitHub DB read-only probe failed|^Vercel DB read-only probe failed/.test(e.message);
  console.error('[DB COMPARISON] '+(safe?e.message:'Read-only comparison could not complete; inspect permissions and URL modes without exposing credentials'));
  process.exitCode=1;
});
