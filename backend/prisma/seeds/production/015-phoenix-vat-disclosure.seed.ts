import { ProductionSeed } from './types';
import { phoenixQuotedPrices } from './014-phoenix-solid-tire-retail.seed';

/** Customer-confirmed sales policy: listed PHOENIX retail prices exclude VAT.
 * VAT invoices can be issued on request; applicable tax is quoted separately.
 * This release changes disclosure tags only and never changes a selling price.
 */
export const phoenixVatDisclosureSeed: ProductionSeed = {
  key: '015-phoenix-vat-disclosure',
  name: 'Disclose VAT-exclusive prices and VAT invoices on request for four PHOENIX tires',
  preview: { productsToCreate: 0 },
  async run(database) {
    for (const entry of phoenixQuotedPrices) {
      const result = await database.product.updateMany({
        where: {
          sku: entry.sku,
          brand: 'PHOENIX',
          tireType: 'SOLID',
          condition: 'NEW_100',
          sellingPrice: entry.price,
          tags: { hasNot: 'VAT_EXCLUDED_INVOICE_AVAILABLE' },
        },
        data: { tags: { push: 'VAT_EXCLUDED_INVOICE_AVAILABLE' } },
      });
      if (!result || (result as {count?: number}).count !== 1) {
        throw new Error(`PHOENIX ${entry.size} missing, repriced, or previously updated; manual review required`);
      }
    }
  },
};
