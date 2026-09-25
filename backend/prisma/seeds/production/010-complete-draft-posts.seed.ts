import { ContentStatus } from '@prisma/client';
import { contentFor, drafts } from '../../../scripts/complete-local-draft-posts';
import { ProductionSeed } from './types';

// This is a versioned content release. It mirrors the nine local DRAFT posts
// without publishing them, so editorial review remains required.
const imageMetadata: Record<string, { imageUrl: string; imageAlt: string }> = {
  'ke-hoach-noi-dung-lop-dac-xe-nang-so-sanh': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/goc-kho-01.png', imageAlt: 'Các chồng vỏ lốp xe nâng trong kho, dùng làm tư liệu minh họa' },
  'ke-hoach-noi-dung-vo-mam-xe-nang-tong-quan': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/kho-chong-lop-01.png', imageAlt: 'Các chồng vỏ lốp xe nâng trong kho, dùng làm tư liệu minh họa' },
  'mam-xe-nang-va-banh-xe-nang-dinh-huong-lien-he': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/kho-chong-lop-01.png', imageAlt: 'Các chồng vỏ lốp xe nâng trong kho, dùng làm tư liệu minh họa' },
  'chuan-bi-thong-tin-khi-can-tu-van-vo-xe-nang': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/kho-chong-lop-02.png', imageAlt: 'Các chồng vỏ lốp xe nâng trong kho, dùng làm tư liệu minh họa' },
  'lop-xe-nang-giai-thich-thuat-ngu-cho-nguoi-moi': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/loi-di-kho-01.png', imageAlt: 'Lối đi kho cạnh các chồng vỏ lốp xe nâng, dùng làm tư liệu minh họa' },
  'video-ngay-1-khu-vuc-dat-vo-lop-trong-kho': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/goc-kho-01.png', imageAlt: 'Các chồng vỏ lốp xe nâng trong khung hình đại diện video Ngày 1' },
  'ghi-nhan-loi-di-kho-ngay-dau-chuyen-doi': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/loi-di-kho-01.png', imageAlt: 'Lối đi trong kho cạnh các chồng vỏ lốp xe nâng ở tư liệu Ngày 1' },
  'nhat-ky-ngay-1-chong-vo-lop-trong-kho': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/kho-chong-lop-02.png', imageAlt: 'Các chồng vỏ lốp xe nâng xếp dọc theo tường kho trong tư liệu Ngày 1' },
  'tu-lieu-ngay-1-goc-kho-va-vo-lop-xe-nang': { imageUrl: '/images/campaigns/chuyen-kho-2026/day-1/goc-kho-01.png', imageAlt: 'Một góc kho mái tôn có các chồng vỏ lốp xe nâng trong tư liệu Ngày 1' },
};

export const completeDraftPostsSeed: ProductionSeed = {
  key: '010-complete-draft-posts',
  name: 'Create complete local draft post content for editorial review',
  preview: { productsToCreate: 0 },
  async run(database) {
    for (const draft of drafts) {
      const media = imageMetadata[draft.slug];
      const tableOfContents = draft.sections.map(({ title }) => ({
        title,
        anchor: title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
      const seo = {
        title: draft.title,
        description: draft.description,
        primaryKeyword: draft.keyword,
        secondaryKeywords: draft.tags.filter((tag) => tag !== draft.keyword),
        keywords: draft.tags,
        canonicalPath: `/blog/${draft.slug}`,
        robots: 'noindex,follow',
        imageUrl: media.imageUrl,
        imageAlt: media.imageAlt,
      };
      const data = { title: draft.title, slug: draft.slug, excerpt: draft.excerpt, content: contentFor(draft), tags: draft.tags, tableOfContents, seo, status: ContentStatus.DRAFT };
      await database.post.upsert({ where: { slug: draft.slug }, create: data, update: data });
    }
  },
};
