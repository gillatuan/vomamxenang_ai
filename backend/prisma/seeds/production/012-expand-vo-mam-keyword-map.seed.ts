import { SeoKeywordIntent, SeoKeywordStatus, SeoKeywordType } from '@prisma/client';
import { ProductionSeed } from './types';

// Keyword strategy only: all targets are existing public URLs. No city doorway,
// brand, size, price or compatibility claims are created without matching data.
const keywords = [
  { keyword: 'vỏ mâm xe nâng', intent: SeoKeywordIntent.COMMERCIAL, cluster: 'VỎ MÂM XE NÂNG', targetUrl: '/', priority: 5, notes: 'Homepage owns the umbrella commercial-investigation topic.' },
  { keyword: 'vỏ và mâm xe nâng', intent: SeoKeywordIntent.COMMERCIAL, cluster: 'VỎ MÂM XE NÂNG', targetUrl: '/', priority: 4, notes: 'Semantic variation of the homepage topic; do not make a separate page.' },
  { keyword: 'vỏ xe nâng', intent: SeoKeywordIntent.TRANSACTIONAL, cluster: 'VỎ XE NÂNG', targetUrl: '/vo-xe-nang', priority: 5, notes: 'Category landing page.' },
  { keyword: 'lốp xe nâng', intent: SeoKeywordIntent.TRANSACTIONAL, cluster: 'VỎ XE NÂNG', targetUrl: '/vo-xe-nang', priority: 5, notes: 'Category variation; no duplicate landing page.' },
  { keyword: 'vỏ đặc xe nâng', intent: SeoKeywordIntent.TRANSACTIONAL, cluster: 'LỐP ĐẶC XE NÂNG', targetUrl: '/lop-dac-xe-nang', priority: 5, notes: 'Dedicated real category landing page.' },
  { keyword: 'lốp đặc xe nâng', intent: SeoKeywordIntent.TRANSACTIONAL, cluster: 'LỐP ĐẶC XE NÂNG', targetUrl: '/lop-dac-xe-nang', priority: 5, notes: 'Category variation.' },
  { keyword: 'mâm xe nâng', intent: SeoKeywordIntent.TRANSACTIONAL, cluster: 'MÂM XE NÂNG', targetUrl: '/mam-xe-nang', priority: 5, notes: 'Dedicated rim topic page.' },
  { keyword: 'mâm bánh xe nâng', intent: SeoKeywordIntent.COMMERCIAL, cluster: 'MÂM XE NÂNG', targetUrl: '/mam-xe-nang', priority: 4, notes: 'Rim-topic variation; validate against WheelRim data before creating size/model pages.' },
  { keyword: 'vỏ xe nâng cũ', intent: SeoKeywordIntent.COMMERCIAL, cluster: 'VỎ XE NÂNG CŨ', targetUrl: '/products/lop-xe-nang-cu-6-00-9-can-kiem-tra-thuc-te', priority: 3, notes: 'Maps to existing product only; condition and compatibility require real-world confirmation.' },
  { keyword: 'cách đọc thông số lốp xe nâng', intent: SeoKeywordIntent.INFORMATIONAL, cluster: 'HƯỚNG DẪN VỎ XE NÂNG', targetUrl: '/blog/doc-thong-so-lop-xe-nang-truoc-khi-thay', priority: 4, notes: 'Existing informational post.' },
  { keyword: 'lốp đặc hay lốp hơi xe nâng', intent: SeoKeywordIntent.INFORMATIONAL, cluster: 'HƯỚNG DẪN VỎ XE NÂNG', targetUrl: '/blog/chon-lop-dac-hay-lop-hoi-cho-xe-nang', priority: 4, notes: 'Existing comparison post.' },
  { keyword: 'kiểm tra mâm xe nâng', intent: SeoKeywordIntent.INFORMATIONAL, cluster: 'MÂM XE NÂNG', targetUrl: '/blog/kiem-tra-mam-xe-nang-truoc-khi-ep-lop', priority: 4, notes: 'Existing inspection guide.' },
];

export const expandVoMamKeywordMapSeed: ProductionSeed = {
  key: '012-expand-vo-mam-keyword-map', name: 'Expand verified vỏ mâm xe nâng keyword-to-URL mapping', preview: { productsToCreate: 0 },
  async run(database) {
    if (!database.seoKeyword) throw new Error('SEO keyword migration/client required before seed 012');
    for (const entry of keywords) await database.seoKeyword.upsert({ where: { keyword: entry.keyword }, create: { ...entry, type: SeoKeywordType.PRIMARY, status: SeoKeywordStatus.ACTIVE }, update: { intent: entry.intent, cluster: entry.cluster, targetUrl: entry.targetUrl, priority: entry.priority, notes: entry.notes, status: SeoKeywordStatus.ACTIVE } });
  },
};
