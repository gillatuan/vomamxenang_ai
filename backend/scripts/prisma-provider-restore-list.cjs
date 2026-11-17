'use strict';

// An archive from managed Prisma Postgres contains provider-specific extension
// metadata that a stock PostgreSQL 18 container cannot recreate. Preserve the
// COMPLETE archive unchanged for recovery on the original provider, but omit
// only that exact extension and its COMMENT from the isolated verification
// restore. All application schema, data, constraints and indexes still restore
// with --exit-on-error, followed by row-count and content-fingerprint checks.
const NAME = 'prisma_postgres';
function providerRestoreList(toc) {
  if (typeof toc !== 'string') throw new Error('Invalid restore TOC');
  let extensions = 0;
  let comments = 0;
  const lines = toc.split('\n').map(line => {
    if (/^\s*\d+;\s+\d+\s+\d+\s+EXTENSION - prisma_postgres(?:\s+[^\r\n]+)?$/.test(line)) {
      extensions++;
      return ';' + line;
    }
    if (/^\s*\d+;\s+\d+\s+\d+\s+COMMENT - EXTENSION prisma_postgres(?:\s+[^\r\n]+)?$/.test(line)) {
      comments++;
      return ';' + line;
    }
    return line;
  });
  if (extensions !== 1 || comments > 1) throw new Error('PROVIDER_RESTORE_TOC_INVALID');
  return { list: lines.join('\n'), excludedEntries: extensions + comments };
}
module.exports = { providerRestoreList, NAME };
