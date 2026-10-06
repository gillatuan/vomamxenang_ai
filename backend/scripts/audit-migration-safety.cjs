const fs = require('node:fs');

const files = process.argv.slice(2);
const destructive = [
  /\bDROP\s+(TABLE|COLUMN|TYPE|INDEX)\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\s+TABLE\b[\s\S]*\bSET\s+NOT\s+NULL\b/i,
  /\bALTER\s+TYPE\b/i,
];

let failed = false;
for (const file of files) {
  const sql = fs.readFileSync(file, 'utf8');
  const hits = destructive.filter((pattern) => pattern.test(sql));
  if (hits.length) {
    failed = true;
    console.error(`Unsafe production migration pattern in ${file}`);
  }
}
if (failed) {
  console.error('Use an expand/contract migration instead of a destructive schema change.');
  process.exit(1);
}
console.log(files.length ? `Migration safety audit passed for ${files.length} changed migration(s).` : 'No changed migrations to audit.');
