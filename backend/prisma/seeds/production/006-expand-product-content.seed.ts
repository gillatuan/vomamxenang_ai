import { ProductionSeed } from './types';

/**
 * Legacy seed key retained for SeedHistory compatibility.
 *
 * The historical implementation produced nearly identical descriptions,
 * specifications and SEO prose from a shared template. This is intentionally
 * retired: all public sales copy is now persisted in Product fields and edited
 * in Admin. Existing production data is not deleted or overwritten.
 *
 * Unique baseline editorial data was already migrated once by seed 016;
 * all subsequent changes are created through Admin, not from seed templates.
 */
export const expandProductContentSeed: ProductionSeed = {
  key: '006-expand-product-content',
  name: 'Legacy editorial template retired (Admin-owned product content)',
  preview: { productsToCreate: 0 },
  async run() {
    // No-op by design. Do not regenerate or overwrite administrator content.
  },
};
