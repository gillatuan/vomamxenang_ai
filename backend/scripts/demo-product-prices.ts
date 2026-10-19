/**
 * Demo-only price suggestions for a non-production catalog.
 * Published competitor prices are reference points, not offers from this store.
 * Never overwrite confirmed pricing or import costs.
 */
export type DemoProduct = {
  id: string; sku: string; type: string; name: string; size: string | null;
  brand: string | null; tireType: string | null; condition: string | null;
  sellingPrice: number | null;
};
export type DemoSuggestion = { amount: number; source: string; note: string };

export const DEMO_PRICE_SOURCES = {
  tire2026: 'https://xenanghiepphat.com/lop-xe-nang',
  used2026: 'https://lopxenang.vn/lop-xe-nang-cu/',
} as const;

// Price per unit, VND. Conservative indicative examples drawn from 2026 listings.
const solidPrices: Record<string, number> = {
  '5.00-8': 1800000, '6.00-9': 2100000, '6.50-10': 2650000,
  '7.00-12': 3300000, '16X6-8': 1900000, '18X7-8': 2100000,
  '21X8-9': 2700000, '23X9-10': 4400000, '28X9-15': 4800000,
  '3.00-15': 6700000, '300-15': 6700000, '8.15-15': 3900000,
};
const nexenPrices: Record<string, number> = {
  '5.00-8': 2300000, '6.00-9': 3200000, '6.50-10': 3800000,
  '7.00-12': 5300000, '21X8-9': 3600000,
  '28X9-15': 6800000, '3.00-15': 9700000, '300-15': 9700000,
};
const usedSolidPrices: Record<string, number> = {
  '5.00-8': 900000, '6.00-9': 1300000, '6.50-10': 1650000,
  '7.00-12': 2300000, '18X7-8': 1200000, '21X8-9': 1600000, '28X9-15': 3500000,
};
// Sample prices for pneumatic tires, based on published indicative ranges.
const pneumaticPrices: Record<string, number> = {
  '5.00-8': 1200000, '6.00-9': 2250000, '6.50-10': 2800000,
  '7.00-12': 3550000, '18X7-8': 2350000, '21X8-9': 3250000,
  '28X9-15': 4700000, '300-15': 1000000,
};
// No trustworthy like-for-like public wheel-rim list was established in this review.
// Keep rims and unrecognised sizes unpriced rather than guessing.

export function canonicalSize(value: string | null): string {
  const size = (value || '').trim().toUpperCase().replace(/×/g, 'X').replace(/\s/g, '');
  // Do not conflate different rim/tire specifications.
  return size;
}

export function suggestDemoPrice(product: DemoProduct): DemoSuggestion | null {
  if (product.type !== 'TIRE' || !product.size) return null;
  if (product.sellingPrice !== null && product.sellingPrice !== undefined) return null;
  const size = canonicalSize(product.size);
  const tireType = (product.tireType || '').toUpperCase();
  const used = (product.condition || '').toUpperCase() === 'USED';
  const isNexen = /NEXEN/i.test(product.brand || '');
  if (used) {
    if (tireType !== 'SOLID') return null;
    const amount = usedSolidPrices[size];
    return amount ? { amount, source: DEMO_PRICE_SOURCES.used2026, note: 'Giá mẫu cho vỏ đặc đã qua sử dụng; không phản ánh độ mòn thực tế' } : null;
  }
  if (tireType === 'PNEUMATIC') {
    const amount = pneumaticPrices[size];
    return amount ? { amount, source: DEMO_PRICE_SOURCES.tire2026, note: 'Giá mẫu cho vỏ hơi' } : null;
  }
  // NON_MARKING often costs more; don't invent a quote for it.
  if (tireType !== 'SOLID') return null;
  const amount = isNexen ? nexenPrices[size] : solidPrices[size];
  return amount ? { amount, source: isNexen ? DEMO_PRICE_SOURCES.tire2026 : DEMO_PRICE_SOURCES.tire2026, note: 'Giá mẫu thử nghiệm, không phải báo giá kinh doanh' } : null;
}
