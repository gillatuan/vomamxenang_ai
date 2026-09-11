export const seoKeywordClusters = {
  main: ['vỏ mâm xe nâng', 'vỏ và mâm xe nâng', 'vỏ mâm bánh xe nâng'],
  tire: ['vỏ xe nâng', 'lốp xe nâng', 'vỏ lốp xe nâng', 'bánh xe nâng'],
  solid: ['vỏ đặc xe nâng', 'lốp đặc xe nâng', 'vỏ xe nâng đặc'],
  pneumatic: ['vỏ hơi xe nâng', 'lốp hơi xe nâng', 'vỏ xe nâng hơi'],
  rim: ['mâm xe nâng', 'mâm bánh xe nâng', 'mâm lốp xe nâng'],
  commercial: ['giá vỏ xe nâng', 'mua vỏ xe nâng', 'nhà cung cấp vỏ xe nâng'],
  service: ['thay vỏ xe nâng', 'ép vỏ xe nâng', 'ép mâm xe nâng'],
} as const;
export type SearchIntent = 'TRANSACTIONAL' | 'COMMERCIAL INVESTIGATION' | 'INFORMATIONAL' | 'NAVIGATIONAL';
export function uniqueKeywords(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  return values.filter((value): value is string => {
    if (!value?.trim()) return false;
    const key = value.trim().toLocaleLowerCase('vi');
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).map(value => value.trim());
}
export function hasFilters(params: Record<string, string | string[] | undefined> = {}) {
  return ['brand', 'size', 'type', 'page', 'sort', 'condition', 'q', 'search', 'tireType', 'category', 'tag'].some(key => params[key] !== undefined);
}
