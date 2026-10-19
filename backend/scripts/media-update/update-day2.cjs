const { createHash } = require('node:crypto');
const payload = require('./day2-media.json');
const manifest = require('./media-manifest.json');
const expectedSlug = 'nhat-ky-chuyen-kho-vo-mam-xe-nang-ngay-2-15-09-2026';

function validate() {
  if (payload.slug !== expectedSlug) throw Error('WRONG_TARGET');
  const imgs = [...payload.content.matchAll(/<img\b[^>]*src="([^"]+)"/g)];
  const videos = [...payload.content.matchAll(/<video\b[^>]*src="([^"]+)"/g)];
  const sources = [...imgs, ...videos].map(m => m[1]).sort();
  if (imgs.length !== 7 || videos.length !== 3 || new Set(sources).size !== 10 ||
      JSON.stringify(sources) !== JSON.stringify(manifest.map(m => m.path).sort()) ||
      (payload.content.match(/<figcaption>/g) || []).length !== 10 ||
      /<script|\son\w+=|autoplay|<iframe/i.test(payload.content) ||
      videos.some(m => !m[0].includes('controls') || !m[0].includes('preload="metadata"'))) {
    throw Error('INVALID_MEDIA_PAYLOAD');
  }
}

async function verifyMedia(origin = 'https://www.vomamxenang.com') {
  for (const asset of manifest) {
    const response = await fetch(origin + asset.path, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw Error('MEDIA_UNAVAILABLE');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw Error('MEDIA_HASH_MISMATCH');
  }
  console.log('DEPLOYED_MEDIA_VERIFIED: 7 photos, 3 videos');
}

async function updateArticle(db, dryRun = false) {
  validate();
  return db.$transaction(async tx => {
    const rows = await tx.post.findMany({ where: { slug: expectedSlug } });
    if (rows.length !== 1) throw Error('EXPECTED_EXACTLY_ONE_ARTICLE');
    const current = rows[0];
    if (current.title !== payload.expectedTitle) throw Error('TITLE_CHANGED');
    if (current.content === payload.content) return { result: 'ALREADY_UPDATED_VERIFIED', status: current.status, photos: 7, videos: 3 };
    const original = payload.expectedContent.trim();
    const legacyFiltered = original.replace(/<img\b[^>]*>/g, '');
    if (![original, legacyFiltered].includes(current.content.trim())) throw Error('CONTENT_CHANGED_REVIEW_REQUIRED');
    if (dryRun) return { result: 'READY_TO_UPDATE', status: current.status };
    const written = await tx.post.updateMany({
      where: { id: current.id, slug: expectedSlug, updatedAt: current.updatedAt, content: current.content },
      data: { content: payload.content },
    });
    if (written.count !== 1) throw Error('CONCURRENT_EDIT');
    const after = await tx.post.findUnique({ where: { id: current.id } });
    if (!after || after.content !== payload.content) throw Error('CONTENT_VERIFICATION_FAILED');
    for (const key of Object.keys(current)) {
      if (!['content', 'updatedAt'].includes(key) && JSON.stringify(current[key]) !== JSON.stringify(after[key])) {
        throw Error('UNEXPECTED_FIELD_CHANGE');
      }
    }
    return { result: 'UPDATED_AND_VERIFIED', status: after.status, photos: 7, videos: 3 };
  }, { isolationLevel: 'Serializable', timeout: 20000 });
}

module.exports = { validate, updateArticle };
if (require.main === module) {
  (async () => {
    validate();
    await verifyMedia();
    if (process.argv.includes('--verify-media-only')) return;
    if (process.env.CONFIRMATION !== 'UPDATE-DAY2-FULL-MEDIA') throw Error('CONFIRMATION_REQUIRED');
    const url = new URL(process.env.DATABASE_URL || '');
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw Error('DIRECT_DATABASE_REQUIRED');
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    try { console.log(JSON.stringify(await updateArticle(db, process.argv.includes('--dry-run')))); }
    finally { await db.$disconnect(); }
  })().catch(error => {
    const safe = ['WRONG_TARGET', 'INVALID_MEDIA_PAYLOAD', 'MEDIA_UNAVAILABLE', 'MEDIA_HASH_MISMATCH', 'CONFIRMATION_REQUIRED', 'DIRECT_DATABASE_REQUIRED', 'EXPECTED_EXACTLY_ONE_ARTICLE', 'TITLE_CHANGED', 'CONTENT_CHANGED_REVIEW_REQUIRED', 'CONCURRENT_EDIT', 'CONTENT_VERIFICATION_FAILED', 'UNEXPECTED_FIELD_CHANGE'];
    console.error(safe.includes(error.message) ? error.message : 'DAY2_UPDATE_STOPPED');
    process.exitCode = 1;
  });
}
