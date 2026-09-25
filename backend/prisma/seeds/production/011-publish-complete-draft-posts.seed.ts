import { ContentStatus } from '@prisma/client';
import { contentFor, drafts } from '../../../scripts/complete-local-draft-posts';
import { imageMetadata } from './010-complete-draft-posts.seed';
import { ProductionSeed } from './types';

const anchor = (title: string) => title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Explicit editorial approval to publish the completed nine-post release.
// Google may crawl/index eligible URLs after this release; indexing itself is
// controlled by Google and is not guaranteed by a robots directive.
export const publishCompleteDraftPostsSeed: ProductionSeed = {
  key: '011-publish-complete-draft-posts',
  name: 'Publish complete draft posts and permit search indexing',
  preview: { productsToCreate: 0 },
  async run(database) {
    for (const draft of drafts) {
      const media = imageMetadata[draft.slug];
      const data = {
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        content: contentFor(draft),
        tags: draft.tags,
        tableOfContents: draft.sections.map(({ title }) => ({ title, anchor: anchor(title) })),
        seo: {
          title: draft.title,
          description: draft.description,
          primaryKeyword: draft.keyword,
          secondaryKeywords: draft.tags.filter((tag) => tag !== draft.keyword),
          keywords: draft.tags,
          canonicalPath: `/blog/${draft.slug}`,
          robots: 'index,follow',
          imageUrl: media.imageUrl,
          imageAlt: media.imageAlt,
        },
        status: ContentStatus.PUBLISHED,
      };
      await database.post.upsert({ where: { slug: draft.slug }, create: data, update: data });
    }
  },
};
