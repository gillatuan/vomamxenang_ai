import { phoenixVatDisclosureSeed } from '../prisma/seeds/production/015-phoenix-vat-disclosure.seed';
import { phoenixQuotedPrices } from '../prisma/seeds/production/014-phoenix-solid-tire-retail.seed';

const assert = (valid: unknown, message: string) => { if (!valid) throw new Error(message); };
async function main() {
  const seen: any[] = [];
  const database: any = { product: { updateMany: async (args: any) => {
    seen.push(args);
    return { count: 1 };
  } } };
  await phoenixVatDisclosureSeed.run(database);
  assert(seen.length === 4, 'Exactly four PHOENIX products should be tagged');
  for (const [index, call] of seen.entries()) {
    assert(call.where.sku === phoenixQuotedPrices[index].sku, 'SKU must match source 014');
    assert(call.where.sellingPrice === phoenixQuotedPrices[index].price, 'Price guard required');
    assert(call.data.tags.push === 'VAT_EXCLUDED_INVOICE_AVAILABLE', 'VAT disclosure tag required');
    assert(!Object.prototype.hasOwnProperty.call(call.data, 'sellingPrice'), 'Never alter existing selling price');
  }
  const failed: any = { product: { updateMany: async () => ({ count: 0 }) } };
  try {
    await phoenixVatDisclosureSeed.run(failed);
    throw new Error('Expected conflict');
  } catch (e) {
    assert(e instanceof Error && e.message.includes('manual review required'), 'Must fail closed on missing/changed products');
  }
  console.log('PHOENIX VAT disclosure checks passed.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
