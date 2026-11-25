'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { urlsFromSitemap, attrs, parseProductJsonLd, inspect } = require('../scripts/audit-production-product-seo.cjs');
const url='https://www.vomamxenang.com/products/vo-dac-phoenix-650-10';
function page({ canonical=url, noindex=false, noImage=false }={}) {
  return {
    text: '<!doctype html><html><head><title>Vỏ đặc xe nâng PHOENIX 6.50-10 | Võ Mâm Xe Nâng</title>'+
    '<meta name="description" content="Vỏ đặc PHOENIX 6.50-10 mới, thông tin kích thước và tư vấn ép lắp theo mâm thực tế.">'+
    '<link rel="canonical" href="'+canonical+'">'+
    (noindex?'<meta name="robots" content="noindex,follow">':'')+
    '<script type="application/ld+json">'+JSON.stringify([{
      '@type':'Product',name:'Vỏ đặc PHOENIX',sku:'PHX-650',url,
      ...(noImage?{}:{image:'https://cdn.example.com/phoenix.jpg'}),
      offers:{'@type':'Offer',price:3190000,priceCurrency:'VND'}
    }])+'</script></head><body><h1>Vỏ đặc PHOENIX 6.50-10</h1></body></html>',
    headers: new Headers(),
    finalUrl:url,
  };
}
test('sitemap only accepts canonical production product URLs', ()=>{
  assert.deepEqual(urlsFromSitemap('<urlset><url><loc>'+url+'</loc></url><url><loc>https://evil.invalid/products/x</loc></url></urlset>'),[url]);
});
test('metadata and JSON-LD pass when consistent',()=>{
  const result=inspect(url,page());
  assert.deepEqual(result.problems,[]);
  assert(result.productImage);
  assert.equal(result.productSku,'PHX-650');
});
test('bad canonical and noindex are failures',()=>{
  const result=inspect(url,page({canonical:'https://www.vomamxenang.com/products/wrong',noindex:true}));
  assert(result.problems.some(x=>x.includes('Canonical mismatch')));
  assert(result.problems.some(x=>x.includes('noindex')));
});
test('missing real product image is warning, not a substitute image',()=>{
  const result=inspect(url,page({noImage:true}));
  assert.equal(result.problems.length,0);
  assert(result.warnings.some(x=>x.includes('No real product image')));
});
test('attribute parser handles single or double quotes',()=>{
  assert.equal(attrs('<meta name="description" content=\'hello\'>').content,'hello');
  assert.equal(attrs('<link rel=\'canonical\' href="'+url+'">').href,url);
});
