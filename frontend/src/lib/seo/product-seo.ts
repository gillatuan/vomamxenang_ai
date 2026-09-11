import type { Product } from '../api-client';
import { uniqueKeywords } from './keyword-utils';
export function productSeoDefaults(product: Partial<Product>) {
  const category = product.type === 'SERVICE' ? 'Dịch vụ xe nâng' : product.type === 'RIM' ? 'Mâm xe nâng' : product.tireType === 'SOLID' ? 'Vỏ đặc xe nâng' : product.tireType === 'PNEUMATIC' ? 'Vỏ hơi xe nâng' : 'Vỏ xe nâng';
  const name = product.name || uniqueKeywords([category, product.brand, product.size]).join(' ');
  const parts = [name];
  for (const fact of [product.brand, product.size]) if (fact && !name.toLocaleLowerCase('vi').includes(fact.toLocaleLowerCase('vi'))) parts.push(fact);
  const title = parts.join(' · ');
  const condition = product.condition === 'USED' ? 'Đã qua sử dụng; cần kiểm tra thực tế.' : '';
  return { title, description: `${title}. ${condition} Xem thông tin và tư vấn đối chiếu kích thước, mâm, điều kiện vận hành trước khi chọn.`.replace(/\s+/g, ' ').trim(), primaryKeyword: product.type === 'SERVICE' ? name : uniqueKeywords([category, product.brand, product.size]).join(' '), secondaryKeywords: product.type === 'SERVICE' ? [] : uniqueKeywords([product.size ? `${category} ${product.size}` : null, product.brand ? `${category} ${product.brand}` : null]), imageAlt: name };
}
