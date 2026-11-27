'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {extractExpectations,summarize} = require('./audit-historical-production-migrations.cjs');

const migrations = [
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
  '20261127120000_product_price_range',
];
test('parse all historical migrations into meaningful expected objects',()=>{
  for (const name of migrations) {
    const sql = fs.readFileSync(path.join(__dirname,'../prisma/migrations',name,'migration.sql'),'utf8');
    const x=extractExpectations(sql);
    assert(x.tables.length+x.columns.length+x.types.length+x.indexes.length+x.constraints.length>0,name);
  }
});
test('parse multiple ALTER TABLE ADD COLUMN declarations',()=>{
  const sql=fs.readFileSync(path.join(__dirname,'../prisma/migrations/20261127120000_product_price_range/migration.sql'),'utf8');
  const x=extractExpectations(sql);
  assert.deepEqual(x.columns.map(c=>c.column),['priceMin','priceMax']);
  assert(x.constraints.includes('Product_price_range_valid'));
});
test('detect exact enum labels and foreign key constraints from quote leads',()=>{
  const sql=fs.readFileSync(path.join(__dirname,'../prisma/migrations/20261005080000_add_quote_leads/migration.sql'),'utf8');
  const x=extractExpectations(sql);
  assert.deepEqual(x.types.find(t=>t.name==='QuoteLeadStatus').labels,['NEW','CONTACTED','QUOTED','WON','LOST']);
  assert(x.constraints.includes('QuoteLead_productId_fkey'));
  assert(x.tables.includes('QuoteLead'));
});
test('never call schema-only presence fully applied without ledger',()=>{
  const reviewed=summarize({migration:migrations[0],history:{status:'NOT_RECORDED',checksumMatchesFile:false},
    objects:[{kind:'table',name:'QuoteLead',status:'PRESENT'}]});
  assert.equal(reviewed.assessment,'OBJECT_NAMES_PRESENT_HISTORY_MISSING_REQUIRES_DEFINITION_AUDIT');
});
test('missing schema blocks assumed historical equivalence',()=>{
  const reviewed=summarize({migration:migrations[0],history:{status:'NOT_RECORDED',checksumMatchesFile:false},
    objects:[{kind:'table',name:'QuoteLead',status:'MISSING'}]});
  assert.equal(reviewed.assessment,'PARTIAL_OR_ABSENT_SCHEMA_REQUIRES_REVIEW');
});
