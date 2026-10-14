export const fallbackCatalogCategories = [
  { id: 'category-tires', name: 'Vỏ xe nâng' },
  { id: 'category-rims', name: 'Mâm xe nâng' },
];
export function catalogProductType(categoryId: string): 'TIRE' | 'RIM' | undefined {
  if (categoryId === 'category-tires') return 'TIRE';
  if (categoryId === 'category-rims') return 'RIM';
  return undefined;
}
