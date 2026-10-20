/**
 * Publicly listed 2026 reference prices (VND/unit), NOT this shop's final offers.
 * Sources: https://xenanghiepphat.com/lop-xe-nang
 *          https://xenangbainhat.vn/lop-dac-xe-nang/
 *          https://partsworld.vn/lop-xe-nang-heli/
 * Prices are applied only to missing sellingPrice; mark product as reference.
 */
export const REFERENCE_PRICE_TAG = 'PRICE_REFERENCE_2026';
export type ReferenceProduct = {
  type: string; size: string | null; brand: string | null;
  tireType: string | null; condition: string | null; sellingPrice: number | null;
};
export type ReferencePrice = { amount: number; source: string; category: string };
const source = 'https://xenanghiepphat.com/lop-xe-nang';
const byBrand: Record<string, Record<string,number>> = {
  CASUMINA: {'5.00-8':1440000,'6.00-9':1980000,'6.50-10':2430000,'7.00-12':3100000,'21X8-9':2700000,'23X9-10':4900000,'28X9-15':4800000,'300-15':7200000},
  PHOENIX: {'5.00-8':1850000,'6.00-9':2100000,'6.50-10':2650000,'7.00-12':3300000,'21X8-9':2300000,'23X9-10':4400000,'28X9-15':4000000,'300-15':6700000},
  NEXEN: {'5.00-8':2200000,'6.00-9':3200000,'6.50-10':3800000,'7.00-12':5300000,'21X8-9':3600000,'23X9-10':6100000,'28X9-15':6800000,'300-15':9700000},
  MICHELIN: {'5.00-8':3800000,'6.00-9':4900000,'6.50-10':5800000,'7.00-12':8200000,'21X8-9':5200000,'23X9-10':8900000,'28X9-15':9500000,'300-15':12500000},
  BRIDGESTONE: {'5.00-8':2850000,'6.00-9':3250000,'6.50-10':4150000,'7.00-12':5400000,'21X8-9':3700000,'23X9-10':6350000,'28X9-15':6900000,'300-15':10800000},
  ASCENDO: {'5.00-8':1900000,'6.00-9':2250000,'6.50-10':2750000,'7.00-12':3800000,'21X8-9':2500000,'23X9-10':4700000,'28X9-15':4600000,'300-15':7000000}
};
const pneumaticRangeMidpoints: Record<string,number> = {
  '6.00-9':1250000,'7.00-12':1250000,'28X9-15':1250000
};
const pneumaticSource = 'https://partsworld.vn/lop-xe-nang-heli/';
const rimMidpoints: Record<string,number> = {
  '5.00-8':1750000,'6.00-9':1750000,'6.50-10':2000000,'7.00-12':2000000,
  '18X7-8':1750000,'21X8-9':1750000,'8.25-15':2250000,
};
const rimSource = 'https://fxbike.vn/la-zang-xe/';
export function normalizeReferenceSize(input: string|null): string {
  return (input||'').trim().toUpperCase().replace(/×/g,'X').replace(/\s/g,'').replace(/^3\.00-15$/,'300-15');
}
export function getReferencePrice(p: ReferenceProduct): ReferencePrice|null {
  if (p.sellingPrice != null || !p.size) return null;
  const size = normalizeReferenceSize(p.size);
  const type = p.type.toUpperCase();
  const condition = (p.condition||'').toUpperCase();
  if (condition === 'USED' || condition === 'SECOND_HAND') return null; // condition grading needed
  if (type === 'RIM') {
    const amount = rimMidpoints[size];
    return amount ? {amount,source:rimSource,category:'RIM_MIDPOINT_2023_24'} : null;
  }
  if (type !== 'TIRE') return null;
  const tireType = (p.tireType||'').toUpperCase();
  if (tireType === 'PNEUMATIC') {
    const amount = pneumaticRangeMidpoints[size];
    return amount ? {amount,source:pneumaticSource,category:'PNEUMATIC_RANGE_MIDPOINT'}:null;
  }
  if (tireType !== 'SOLID') return null;
  const brand = (p.brand||'').trim().toUpperCase();
  // No brand-specific claims based on a different brand's published listing.
  const amount = byBrand[brand]?.[size];
  return amount ? {amount,source,category:'EXACT_BRAND_SIZE_SOLID'} : null;
}
