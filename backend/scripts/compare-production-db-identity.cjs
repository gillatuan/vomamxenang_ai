#!/usr/bin/env node
'use strict';
// Production comparison without decrypting any Vercel Secret.
// Compares IDs, SKUs and slugs in the public backend catalog against published
// products from the GitHub DIRECT_DATABASE_URL; all DB access is read-only.
// No secret, hostname, product inventory, or customer record is printed.
const fs=require('node:fs');
const crypto=require('node:crypto');
const {PrismaClient}=require('@prisma/client');

function catalogEntries(products) {
  if(!Array.isArray(products))throw Error('Backend product API did not return an array');
  if(products.length<1 || products.length>10000)throw Error('Unexpected published product count');
  const entries=products.map(p=>{
    if(typeof p.id!=='string'||!p.id||typeof p.sku!=='string'||!p.sku)throw Error('Product missing id/sku');
    return [p.id,p.sku,typeof p.slug==='string'?p.slug:''];
  });
  entries.sort((a,b)=>a[0].localeCompare(b[0]));
  if(new Set(entries.map(x=>x[0])).size!==entries.length)throw Error('Duplicate product IDs in source');
  return entries;
}
function digest(records) {
  return crypto.createHash('sha256').update(JSON.stringify(catalogEntries(records))).digest('hex');
}
async function readGithubDb() {
  const raw=process.env.GITHUB_DIRECT_DATABASE_URL;
  if(!raw)throw Error('Missing GitHub direct PostgreSQL connection');
  const prisma=new PrismaClient({datasources:{db:{url:raw}}});
  try{
    return await prisma.$transaction(async tx=>{
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
      await tx.$executeRawUnsafe("SET LOCAL statement_timeout='20000ms'");
      const db=await tx.$queryRawUnsafe('SELECT current_database() AS name, current_schema() AS schema');
      if(db[0]?.name!=='postgres'||db[0]?.schema!=='public')throw Error('Unexpected GitHub database identity');
      const rows=await tx.$queryRawUnsafe('SELECT "id", "sku", "slug" FROM public."Product" WHERE "status" = \'PUBLISHED\'');
      const tables=await tx.$queryRawUnsafe("SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p') AND relname IN ('QuoteLead','CaseStudy','ConversionEvent','SalesQuote','OrderPayment','Product','_prisma_migrations') ORDER BY relname");
      return {products:rows,tableNames:tables.map(x=>x.relname)};
    },{timeout:45000,maxWait:20000});
  }finally{await prisma.$disconnect();}
}
async function main(){
  if(process.env.APP_ENV!=='production')throw Error('Production mode required');
  const filepath=process.env.PRODUCTION_PUBLIC_CATALOG_FILE;
  if(!filepath)throw Error('Missing production backend public catalog file');
  const stat=fs.statSync(filepath);
  if(stat.size>8*1024*1024)throw Error('Public catalog unexpectedly large');
  const api=JSON.parse(fs.readFileSync(filepath,'utf8'));
  const direct=await readGithubDb();
  const backendProducts=catalogEntries(api);
  const githubProducts=catalogEntries(direct.products);
  const sameProducts=backendProducts.length===githubProducts.length &&
    digest(api)===digest(direct.products);
  const result={
    mode:'READ_ONLY',
    comparison:'PUBLIC_BACKEND_VS_GITHUB_DIRECT_DB',
    backendPublicProductCount:backendProducts.length,
    githubPublishedProductCount:githubProducts.length,
    samePublishedProductIdentifiers: sameProducts,
    githubSchemaObjectsPresent:direct.tableNames,
    verdict:sameProducts?'PUBLISHED_PRODUCTS_MATCH__DB_IDENTITY_NOT_YET_PROVEN':
      'PUBLISHED_PRODUCTS_DIFFER__STOP_MIGRATIONS',
    limits:'Identical product records can exist in a clone or replica. A Vercel runtime/provider database-identity proof is still required before any migration.',
  };
  console.log(JSON.stringify(result,null,2));
  if(!sameProducts)process.exitCode=1;
}
if(require.main===module)main().catch(e=>{
  // No raw Prisma errors or API body in logs (could contain connection secrets).
  const safe=['Production mode required','Missing production backend public catalog file',
   'Public catalog unexpectedly large','Backend product API did not return an array',
   'Unexpected published product count','Product missing id/sku',
   'Duplicate product IDs in source','Missing GitHub direct PostgreSQL connection',
   'Unexpected GitHub database identity'].includes(e.message);
  console.error('[DB COMPARISON] '+(safe?e.message:'Comparison could not complete; review connection and public backend response safely'));
  process.exitCode=1;
});
module.exports={catalogEntries,digest};
