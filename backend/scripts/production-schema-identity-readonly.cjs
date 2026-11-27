#!/usr/bin/env node
'use strict';
// Read-only production database/schema identity inventory. No application rows or credentials.
const { PrismaClient } = require('@prisma/client');
const { createHash } = require('node:crypto');
const { writeFileSync } = require('node:fs');
async function main() {
  if (process.env.APP_ENV !== 'production') throw Error('Production mode required');
  const raw=process.env.DATABASE_URL;
  if (!raw) throw Error('Missing DATABASE_URL');
  const parsed=new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) ||
      parsed.hostname.includes('accelerate.prisma-data.net')) throw Error('Direct PostgreSQL required');
  const fingerprint=createHash('sha256').update([
    parsed.hostname.toLowerCase(),parsed.port||'5432',
    decodeURIComponent(parsed.pathname.slice(1)),parsed.searchParams.get('schema')||'public'
  ].join('|')).digest('hex').slice(0,16);
  const prisma=new PrismaClient({datasources:{db:{url:raw}}});
  try {
    const result=await prisma.$transaction(async tx=>{
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
      await tx.$executeRawUnsafe("SET LOCAL statement_timeout='20000ms'");
      const identity=await tx.$queryRawUnsafe("SELECT current_database() AS database_name, current_schema() AS current_schema, current_setting('search_path') AS search_path, pg_is_in_recovery() AS replica");
      const relevant=await tx.$queryRawUnsafe("SELECT n.nspname AS schema_name, c.relname AS table_name, c.relkind AS kind FROM pg_class c JOIN pg_namespace n ON c.relnamespace=n.oid WHERE c.relname IN ('Product','Category','_prisma_migrations','QuoteLead','StoreInfo','CaseStudy','ConversionEvent','QuoteLeadActivity','SalesQuote','SalesQuoteItem','InventoryTransaction','OrderPayment','Order') AND n.nspname NOT IN ('pg_catalog','information_schema') ORDER BY n.nspname,c.relname");
      const schemas=await tx.$queryRawUnsafe("SELECT n.nspname AS schema_name, count(c.oid)::int AS table_count FROM pg_namespace n LEFT JOIN pg_class c ON c.relnamespace=n.oid AND c.relkind='r' WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp_%' GROUP BY n.nspname ORDER BY n.nspname");
      return {identity,relevant,schemas};
    },{timeout:45000,maxWait:20000});
    const id=result.identity[0];
    if(id?.database_name!=='postgres')throw Error('Unexpected database name');
    const refs=result.relevant.map(r=>({schema:r.schema_name,table:r.table_name,kind:r.kind}));
    const productLocations=refs.filter(r=>r.table==='Product').map(r=>r.schema);
    const historyLocations=refs.filter(r=>r.table==='_prisma_migrations').map(r=>r.schema);
    const findings=[];
    if(!productLocations.includes('public'))findings.push('PRODUCT_NOT_IN_PUBLIC');
    if(productLocations.some(s=>s!=='public'))findings.push('PRODUCT_IN_NON_PUBLIC_SCHEMA');
    if(!historyLocations.includes('public'))findings.push('MIGRATION_HISTORY_NOT_IN_PUBLIC');
    const report={
      mode:'READ_ONLY',database:id.database_name,connectionFingerprint:fingerprint,
      configuredSchema:parsed.searchParams.get('schema')||'public',currentSchema:id.current_schema,
      searchPath:id.search_path,isReadReplica:id.replica,
      schemaInventory:result.schemas.map(r=>({schema:r.schema_name,tableCount:r.table_count})),
      relevantObjects:refs,findings,
      interpretation:'Location inventory only. Does not authorize migration resolve or deploy.',
    };
    if(process.env.SCHEMA_IDENTITY_REPORT)writeFileSync(process.env.SCHEMA_IDENTITY_REPORT,JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    if(!productLocations.length){console.error('Product table absent from all inspected schemas');process.exitCode=1;}
  }finally{await prisma.$disconnect();}
}
if(require.main===module)main().catch(err=>{console.error('[SCHEMA IDENTITY] FAILED: '+err.message);process.exitCode=1;});
