const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const Module=require('node:module');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/lib/product-pricing.ts'),'utf8');
const transpiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const m={exports:{}};new Function('module','exports','require',transpiled)(m,m.exports,require);
const {hasQuoteRange,productPriceText,canCheckoutProduct}=m.exports;
test('price range shown with Vietnamese formatting, but cannot checkout',()=>{
  const product={priceMin:1800000,priceMax:2500000,sellingPrice:null,tags:[]};
  assert.equal(hasQuoteRange(product),true);
  assert.match(productPriceText(product),/1\.800\.000.*2\.500\.000/);
  assert.equal(canCheckoutProduct(product),false);
});
test('legacy fixed price remains usable for checkout',()=>{
  const product={priceMin:null,priceMax:null,sellingPrice:3190000,tags:[]};
  assert.equal(canCheckoutProduct(product),true);
  assert.match(productPriceText(product),/3\.190\.000/);
});
test('reference prices cannot be paid even when a fixed amount exists',()=>{
  assert.equal(canCheckoutProduct({sellingPrice:3190000,tags:['PRICE_REFERENCE_2026']}),false);
});
test('missing or malformed ranges never enable checkout by themselves',()=>{
  assert.equal(hasQuoteRange({priceMin:1000000,priceMax:null}),false);
  assert.equal(hasQuoteRange({priceMin:2000000,priceMax:1000000}),false);
});
