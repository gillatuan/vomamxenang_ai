#!/usr/bin/env node
'use strict';

// Production migration reconciliation inventory. All SQL statements are SELECT
// against pg_catalog / information_schema, never migrations or DDL.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PrismaClient } = require('@prisma/client');

const migrationRoot = path.join(__dirname, '../prisma/migrations');
const target = '20261127120000_product_price_range';
const names = [
  '20261005080000_add_quote_leads',
  '20261005090000_store_info_local_seo',
  '20261005100000_add_case_studies',
  '20261005110000_add_conversion_events',
  '20261005130000_lead_crm',
  '20261005140000_sales_quotes',
  '20261005150000_quote_to_order',
  '20261005160000_inventory_transaction_confirmation',
  '20261005170000_order_fulfillment',
  '20261005180000_order_payments',
  '20261005190000_receivables_aging',
  target,
];

function extractExpectations(sql) {
  const tables = [...sql.matchAll(/CREATE\s+TABLE\s+"([^"]+)"/gi)].map(m => m[1]);
  const types = [...sql.matchAll(/CREATE\s+TYPE\s+"([^"]+)"/gi)].map(m => m[1]);
  const indexes = [...sql.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+"([^"]+)"/gi)].map(m => m[1]);
  const constraints = [...sql.matchAll(/\bCONSTRAINT\s+"([^"]+)"|\bADD\s+CONSTRAINT\s+"([^"]+)"/gi)].map(m => m[1] || m[2]);
  const columns = [];
  // Explicit ALTER TABLE ADD COLUMN definitions, including multiline ALTERs.
  const alter = /\bALTER\s+TABLE\s+"([^"]+)"\s+([\s\S]*?);/gi;
  for (const match of sql.matchAll(alter)) {
    for (const col of match[2].matchAll(/\bADD\s+COLUMN\s+"([^"]+)"\s+([^,\n;]+)/gi)) {
      columns.push({ table: match[1], column: col[1], declaration: col[2].trim() });
    }
  }
  // CREATE TABLE body: each leading quoted name is a column.
  for (const match of sql.matchAll(/\bCREATE\s+TABLE\s+"([^"]+)"\s*\(([\s\S]*?)\)\s*;/gi)) {
    for (const line of match[2].split('\n')) {
      const col = line.match(/^\s*"([^"]+)"\s+((?:"[^"]+"|\w+)[^,]*)/);
      if (col) columns.push({ table: match[1], column: col[1], declaration: col[2].trim() });
    }
  }
  return { tables, types, indexes, constraints, columns };
}
function checked(rows, lookup, key, expected, label) {
  for (const name of expected) {
    const match = lookup.get(name);
    rows.push({ kind:label, name, status:match ? 'PRESENT' : 'MISSING',
      ...(match ? { actual:match } : {}) });
  }
}
function summarize(record) {
  const failures = record.objects.filter(item => item.status !== 'PRESENT').length;
  const current = record.history.status;
  // Presence does not establish equivalence: catalog-only inspection cannot
  // prove constraints/definitions exactly match original migration SQL.
  const assessment = current === 'APPLIED' && record.history.checksumMatchesFile && failures === 0
    ? 'HISTORY_AND_OBJECT_NAMES_MATCH'
    : current === 'NOT_RECORDED' && failures === 0
      ? 'OBJECT_NAMES_PRESENT_HISTORY_MISSING_REQUIRES_DEFINITION_AUDIT'
      : current === 'NOT_RECORDED' && failures > 0
        ? 'PARTIAL_OR_ABSENT_SCHEMA_REQUIRES_REVIEW'
        : 'HISTORY_OR_SCHEMA_MISMATCH_REQUIRES_REVIEW';
  return { ...record, assessment };
}
async function main() {
  const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Production direct database secret missing');
  const parsed = new URL(url);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || parsed.hostname.includes('accelerate.prisma-data.net')) {
    throw new Error('Direct PostgreSQL required');
  }
  const prisma = new PrismaClient({datasources:{db:{url}}});
  try {
    const snapshot = await prisma.$transaction(async tx => {
      // SET TRANSACTION READ ONLY runs before all catalog reads, in the same transaction.
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
      await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '20000ms'");
      const identity = {rows:await tx.$queryRawUnsafe('SELECT current_database() AS db_name')};
      const ledger = {rows:await tx.$queryRawUnsafe('SELECT migration_name, checksum, finished_at, rolled_back_at FROM public."_prisma_migrations"')};
      const columnRows = {rows:await tx.$queryRawUnsafe("SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public'")};
      const tableRows = {rows:await tx.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")};
      const indexRows = {rows:await tx.$queryRawUnsafe("SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname='public'")};
      const constraintRows = {rows:await tx.$queryRawUnsafe("SELECT c.conname, pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_namespace ns ON ns.oid=c.connamespace WHERE ns.nspname='public'")};
      const enumRows = {rows:await tx.$queryRawUnsafe("SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' ORDER BY t.typname,e.enumsortorder")};
      return {identity,ledger,columnRows,tableRows,indexRows,constraintRows,enumRows};
    },{timeout:45000,maxWait:20000});
    const {identity,ledger,columnRows,tableRows,indexRows,constraintRows,enumRows}=snapshot;
    if (identity.rows[0]?.db_name !== 'postgres') throw new Error('Unexpected database identity');
    const tables = new Map(tableRows.rows.map(x => [x.table_name, x]));
    const columns = new Map(columnRows.rows.map(x => [x.table_name + '.' + x.column_name, x]));
    const indexes = new Map(indexRows.rows.map(x => [x.indexname, x]));
    const constraints = new Map(constraintRows.rows.map(x => [x.conname, x]));
    const enums = new Map();
    for (const e of enumRows.rows) enums.set(e.typname, [...(enums.get(e.typname)||[]), e.enumlabel]);
    const output = [];
    for (const name of names) {
      const filename = path.join(migrationRoot, name, 'migration.sql');
      if (!fs.existsSync(filename)) throw new Error('Expected SQL file missing: ' + name);
      const sql = fs.readFileSync(filename,'utf8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');
      const h = ledger.rows.filter(x => x.migration_name === name);
      const applied = h.filter(x => x.finished_at && !x.rolled_back_at);
      const history = {
        status: h.length === 0 ? 'NOT_RECORDED' : applied.length === 1 && h.length === 1 ? 'APPLIED' : 'FAILED_OR_MULTIPLE',
        checksumMatchesFile: applied.length === 1 && applied[0].checksum === checksum,
        recordCount:h.length,
      };
      const expected = extractExpectations(sql);
      const objects = [];
      checked(objects,tables,null,expected.tables,'table');
      checked(objects,indexes,null,expected.indexes,'index');
      checked(objects,constraints,null,expected.constraints,'constraint');
      for (const typ of expected.types) {
        objects.push({ kind:'enum',name:typ,status:enums.has(typ) ? 'PRESENT':'MISSING',
          ...(enums.has(typ) ? {labels:enums.get(typ)} : {}) });
      }
      for (const col of expected.columns) {
        const key = col.table + '.' + col.column;
        const actual = columns.get(key);
        objects.push({kind:'column',name:key,status:actual?'PRESENT':'MISSING',
          expectedDeclaration:col.declaration,
          ...(actual?{actual:{dataType:actual.data_type,udt:actual.udt_name,nullable:actual.is_nullable,default:actual.column_default}}:{})});
      }
      output.push(summarize({migration:name,history,objects}));
    }
    const report={
      mode:'READ_ONLY',database:'postgres',
      generatedAt:new Date().toISOString(),
      note:'Presence checks only; does not prove SQL definitions match. Do not migrate resolve or deploy based solely on this audit.',
      summary:{
        migrations:output.length,
        historyMissing:output.filter(x=>x.history.status==='NOT_RECORDED').length,
        allObjectsNamedPresent:output.filter(x=>x.objects.every(o=>o.status==='PRESENT')).length,
        recordsNeedingReview:output.filter(x=>!x.assessment.startsWith('HISTORY_AND_')).length,
      },migrations:output,
    };
    if (process.env.MIGRATION_AUDIT_REPORT) fs.writeFileSync(process.env.MIGRATION_AUDIT_REPORT,JSON.stringify(report,null,2));
    console.log(JSON.stringify({mode:report.mode,summary:report.summary,
      migrationResults:output.map(x=>({migration:x.migration,history:x.history.status,
        present:x.objects.filter(y=>y.status==='PRESENT').length,
        missing:x.objects.filter(y=>y.status==='MISSING').map(y=>y.kind+':'+y.name),
        assessment:x.assessment}))},null,2));
    if (output.some(x=>x.history.status==='FAILED_OR_MULTIPLE')) process.exitCode=1;
  } finally { await prisma.$disconnect(); }
}
if(require.main===module)main().catch(e=>{console.error('[MIGRATION INVENTORY] FAILED: '+e.message);process.exitCode=1;});
module.exports={extractExpectations,summarize};
