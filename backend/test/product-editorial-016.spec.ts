import { editorialProducts016, editorialAllProductsSeed016 } from '../prisma/seeds/production/016-unique-product-editorial.seed';

function assert(value: unknown, message: string) { if (!value) throw Error(message); }
async function main() {
  const skus = editorialProducts016.map(p=>p.sku);
  assert(skus.length===20 && new Set(skus).size===20, 'Each of 20 catalog SKUs needs unique editorial content');
  const sections = ['Đặc điểm và tính chất','Khi nào nên cân nhắc?','Kiểm tra trước khi lắp'];
  const updates: any[] = [];
  const db: any = {
    product: {
      findMany: async ({ where }: any) => {
        assert(where.sku.in.length===20, 'Only reviewed SKU set may be queried');
        return editorialProducts016.map((p,i)=>({
          id: 'p-'+i, sku: p.sku, name: 'Sample '+p.sku, brand:null,
          type:p.sku==='VMXN-SERVICE-TIRE-RIM'?'SERVICE':'TIRE',
          size:null,condition:null,tireType:null,
          sellingPrice:i*100, imageUrl:'https://example.org/photo.jpg', status:'PUBLISHED',
        }));
      },
      updateMany: async ({where,data}:any)=>{
        assert(Object.keys(data).sort().join(',')==='description,highlights,shortDescription', 'Price, status, media and SEO must never change');
        assert(where.id && where.sku && where.type && where.name, 'Full SKU and identity guards required');
        assert(data.description.includes('<h2>') && data.description.includes('<h3>'), 'Sectioned product HTML required');
        for(const section of sections)assert(data.description.includes(section), 'Missing product section');
        assert(data.highlights.length===3, 'Three tailored highlights required');
        updates.push({where,data});
        return {count:1};
      },
    },
  };
  await editorialAllProductsSeed016.run(db);
  assert(updates.length===20, 'Must update 20 records in covered catalog');
  const contents=updates.map(x=>x.data.description);
  assert(new Set(contents).size===20,'Each product must have distinct description');
  for(const [i,e] of editorialProducts016.entries()){
    assert(contents[i].includes(e.heading), 'Unique editorial heading must survive');
    assert(e.opening.length>100 && e.features.length>100 && e.fit.length>70, 'Substantive tailored paragraphs required');
    assert(updates[i].data.shortDescription.length>50,'Specific short description required');
  }
  const subsetDb: any={product:{findMany:async()=>[],updateMany:async()=>{throw Error('Should not update')}}};
  try{await editorialAllProductsSeed016.run(subsetDb);throw Error('Expected abort when nothing matches');}
  catch(e){assert(e instanceof Error && e.message.includes('No existing products'),'Must fail closed on missing catalog');}
  console.log('Editorial content seed 016: 20 unique SKUs, HTML sections and metadata protection verified.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
