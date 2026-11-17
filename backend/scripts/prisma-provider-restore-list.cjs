'use strict';

// An archive from managed Prisma Postgres contains provider-specific extension
// metadata that a stock PostgreSQL 18 container cannot recreate. Preserve the
// COMPLETE archive unchanged for recovery on the original provider, but omit
// only that exact extension and its COMMENT from the isolated verification
// restore. All application schema, data, constraints and indexes still restore
// with --exit-on-error, followed by row-count and content-fingerprint checks.
const NAME = 'prisma_postgres';
function providerRestoreList(toc) {
  if (typeof toc !== 'string') throw new Error('PROVIDER_RESTORE_TOC_INVALID');
  let extensions = 0;
  let comments = 0;
  let providerMentions = 0;
  const lines = toc.split('\n').map(line => {
    // pg_restore TOC can contain variable whitespace, quoted identifiers and
    // trailing ownership fields. Match exact object TYPE and extension NAME,
    // never arbitrary references in SQL, tables, or function descriptions.
    const record = /^\s*\d+;\s+\d+\s+\d+\s+(.+?)\r?$/.exec(line);
    if (!record) return line;
    const detail = record[1];
    if (/prisma_postgres/i.test(detail)) providerMentions++;
    if (/^EXTENSION\s+-\s+"?prisma_postgres"?(?:\s+.*)?$/.test(detail)) {
      extensions++;
      return ';' + line;
    }
    if (/^COMMENT\s+-\s+EXTENSION\s+"?prisma_postgres"?(?:\s+.*)?$/.test(detail)) {
      comments++;
      return ';' + line;
    }
    return line;
  });
  if (extensions > 1 || comments > 1 || (comments > 0 && extensions === 0))
    throw new Error('PROVIDER_RESTORE_TOC_AMBIGUOUS');
  // Some managed providers omit the provider-owned extension itself from
  // pg_dump. In that case there is nothing to exclude: restore the full TOC
  // without suppressing any errors, then compare the actual restored data.
  if (extensions === 0) return { list: toc, excludedEntries: 0, providerMentions };
  return { list: lines.join('\n'), excludedEntries: extensions + comments, providerMentions };
}
module.exports = { providerRestoreList, NAME };
