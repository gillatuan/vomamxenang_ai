import fs from 'fs';
const source=fs.readFileSync('scripts/product-seo-content-migration.ts','utf8');
for(const forbidden of ['importPrice','sellingPrice','stocks:','quantity:']){if(source.includes('data.'+forbidden)||source.includes(`data[\"${forbidden}\"]`))throw new Error('migration mutates protected field '+forbidden);}
if(!source.includes("process.argv.includes('--apply')"))throw new Error('explicit apply gate missing');
if(!source.includes("mode:apply?'apply':'dry-run'"))throw new Error('dry-run evidence missing');
console.log('product SEO migration safety: ok');
