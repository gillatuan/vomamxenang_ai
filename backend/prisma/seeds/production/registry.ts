import { ProductionSeed } from './types';
import { createForkliftTireProductsSeed } from './003-create-forklift-tire-products.seed';
import { curatePublicContentSeed } from './004-curate-public-content.seed';
import { addStoreInfoSeed } from './005-add-store-info.seed';
import { expandProductContentSeed } from './006-expand-product-content.seed';
import { addCatalogImagesSeed } from './007-add-catalog-images.seed';

// Append new releases here. Do not alter a seed after it has run in production;
// create the next numbered seed for corrections or additional products instead.
export const productionSeeds: readonly ProductionSeed[] = [
  createForkliftTireProductsSeed,
  curatePublicContentSeed,
  addStoreInfoSeed,
  expandProductContentSeed,
  addCatalogImagesSeed,
];
