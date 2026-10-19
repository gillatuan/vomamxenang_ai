const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');
const { put, list, head } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');
const base = '/images/campaigns/chuyen-kho-2026/day-2/';
const names = ['kho-lop-theo-cum-01.jpg', 'kho-cu-mam-lop-01.jpg', 'kho-cu-mam-lop-02.jpg', 'cot-lop-sau-sap-xep-01.jpg', 'loi-di-kho-sau-sap-xep-01.jpg', 'IMG_3267.jpeg', 'IMG_3268.jpeg', 'IMG_3260.mp4', 'IMG_3261.mp4', 'IMG_3264.mp4'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function replace(value, mapping) {
  if (typeof value === 'string') {
    for (const [from, to] of Object.entries(mapping)) {
      value = value.split('https://www.vomamxenang.com' + from).join(to);
      value = value.split('https://vomamxenang.com' + from).join(to);
      value = value.split(from).join(to);
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(x => replace(x, mapping));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,replace(v,mapping)]));
  return value;
}
async function main() {
  const envText = readFileSync(process.env.MEDIA_ENV_FILE, 'utf8');
  for (const key of ['BLOB_READ_WRITE_TOKEN', 'BLOB_STORE_ID', 'VERCEL_OIDC_TOKEN']) {
    const match = envText.match(new RegExp('^' + key + '=(.*)$', 'm'));
    if (match) {
      const raw = match[1].trim();
      process.env[key] = raw.startsWith('"') ? JSON.parse(raw) : raw.replace(/^'|'$/g, '');
    }
  }
  console.log(JSON.stringify({ blobTokenConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN), blobOidcConfigured: Boolean(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN) }));
  const teamResponse = await fetch('https://api.vercel.com/v2/teams/' + encodeURIComponent(process.env.VERCEL_ORG_ID), { headers: { Authorization: 'Bearer ' + process.env.VERCEL_TOKEN } });
  if (!teamResponse.ok) throw Error('CANNOT_VERIFY_FREE_PLAN');
  const team = await teamResponse.json();
  const plan = team.billing?.plan;
  console.log('VERCEL_PLAN=' + (['hobby','pro','enterprise'].includes(plan) ? plan : 'unknown'));
  if (plan !== 'hobby') throw Error('FREE_PLAN_REQUIRED_NO_UPLOAD_PERFORMED');
  let cursor, bytes = 0, count = 0;
  do {
    const page = await list({ limit: 1000, ...(cursor ? { cursor } : {}) });
    for (const item of page.blobs) { bytes += item.size; count++; }
    if (count > 10000) throw Error('STORAGE_PREFLIGHT_LIMIT');
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const files = names.map(name => ({ name, bytes: readFileSync(join(__dirname, '../../frontend/public', base.slice(1), name)) }));
  const total = files.reduce((n,f) => n+f.bytes.length,0);
  if (bytes + total > 700000000 || total > 25000000) throw Error('FREE_STORAGE_BUDGET_EXCEEDED');
  console.log(JSON.stringify({ existingStorageBytes: bytes, migrationBytes: total, files: files.length }));
  if (process.env.CONFIRMATION !== 'MOVE-DAY2-MEDIA-OFF-GIT') throw Error('CONFIRMATION_REQUIRED');
  const mapping = {};
  for (const file of files) {
    const hash = digest(file.bytes);
    const pathname = 'content/chuyen-kho-2026/day-2/' + hash.slice(0,16) + '-' + file.name;
    let blob;
    try { blob = await head(pathname); } catch (error) { if (error.name !== 'BlobNotFoundError') throw error; }
    if (!blob) blob = await put(pathname, file.bytes, { access: 'public', addRandomSuffix: false, contentType: file.name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg' });
    if (!/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(blob.url)) throw Error('UNEXPECTED_STORAGE_URL');
    const response = await fetch(blob.url);
    if (!response.ok || digest(Buffer.from(await response.arrayBuffer())) !== hash) throw Error('UPLOADED_MEDIA_VERIFICATION_FAILED');
    mapping[base + file.name] = blob.url;
  }
  console.log('MEDIA_MAPPING=' + JSON.stringify(mapping));
  const db = new PrismaClient();
  try {
    const changed = await db.$transaction(async tx => {
      const posts = await tx.post.findMany();
      let changed = 0;
      for (const post of posts) {
        const data = {};
        for (const field of ['content','seo','videoUrl']) {
          const updated = replace(post[field], mapping);
          if (JSON.stringify(updated) !== JSON.stringify(post[field])) data[field] = updated;
        }
        if (!Object.keys(data).length) continue;
        const result = await tx.post.updateMany({ where: { id: post.id, updatedAt: post.updatedAt }, data });
        if (result.count !== 1) throw Error('CONCURRENT_ARTICLE_EDIT');
        const after = await tx.post.findUnique({ where: { id: post.id } });
        for (const field of Object.keys(post)) {
          if (field === 'updatedAt') continue;
          const expected = Object.hasOwn(data, field) ? data[field] : post[field];
          if (JSON.stringify(expected) !== JSON.stringify(after[field])) throw Error('ARTICLE_VERIFICATION_FAILED');
        }
        changed++;
      }
      return changed;
    }, { isolationLevel: 'Serializable', timeout: 30000 });
    console.log('MEDIA_MOVE_VERIFIED=' + JSON.stringify({ files: files.length, postsUpdated: changed, statusesPreserved: true }));
  } finally { await db.$disconnect(); }
}
main().catch(error => {
  const safe = ['CANNOT_VERIFY_FREE_PLAN','FREE_PLAN_REQUIRED_NO_UPLOAD_PERFORMED','STORAGE_PREFLIGHT_LIMIT','FREE_STORAGE_BUDGET_EXCEEDED','CONFIRMATION_REQUIRED','UNEXPECTED_STORAGE_URL','UPLOADED_MEDIA_VERIFICATION_FAILED','CONCURRENT_ARTICLE_EDIT','ARTICLE_VERIFICATION_FAILED'];
  console.error(safe.includes(error.message) ? error.message : 'MEDIA_MOVE_STOPPED:' + error.name);
  process.exitCode = 1;
});
