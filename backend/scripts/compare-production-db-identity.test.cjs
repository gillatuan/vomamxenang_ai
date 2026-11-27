const { test }=require('node:test');
const assert=require('node:assert/strict');
const {catalogEntries,digest}=require('./compare-production-db-identity.cjs');
test('fingerprint is insensitive to product array ordering',()=>{
 const a=[{id:'b',sku:'S2',slug:'two'},{id:'a',sku:'S1',slug:'one'}];
 assert.equal(digest(a),digest([...a].reverse()));
});
test('fingerprint changes when identifiers change',()=>{
 const a=[{id:'a',sku:'S1',slug:'one'}];
 assert.notEqual(digest(a),digest([{...a[0],slug:'different'}]));
});
test('rejects duplicate or incomplete identifiers',()=>{
 assert.throws(()=>catalogEntries([{id:'a',sku:'X'},{id:'a',sku:'X'}]),/Duplicate/);
 assert.throws(()=>catalogEntries([{id:'a'}]),/missing/);
});
test('rejects empty catalog (no false positive)',()=>assert.throws(()=>catalogEntries([]),/Unexpected/));
