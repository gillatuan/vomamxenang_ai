const token = process.env.PRISMA_MANAGEMENT_TOKEN;
const databaseId = process.env.PRISMA_DATABASE_ID;
if (!token || !databaseId) {
  console.error("::error::PRISMA_MANAGEMENT_TOKEN and PRISMA_DATABASE_ID are required");
  process.exit(1);
}
const maxAgeHours = 24;
const url = `https://api.prisma.io/v1/databases/${encodeURIComponent(databaseId)}/backups?limit=25`;
const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
if (!response.ok) {
  console.error(`::error::Unable to verify Prisma managed backups (HTTP ${response.status})`);
  process.exit(1);
}
const payload = await response.json();
const items = Array.isArray(payload) ? payload : (payload.data ?? payload.backups ?? []);
const ready = items.filter((b) => ["ready", "completed", "success"].includes(String(b.status).toLowerCase()));
ready.sort((a,b) => new Date(b.createdAt ?? b.created_at) - new Date(a.createdAt ?? a.created_at));
if (!ready.length) {
  console.error("::error::No completed provider-managed production backup found");
  process.exit(1);
}
const latest = ready[0];
const createdAt = latest.createdAt ?? latest.created_at;
const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
if (!Number.isFinite(ageHours) || ageHours < 0 || ageHours > maxAgeHours) {
  console.error(`::error::Latest production backup is not within ${maxAgeHours} hours`);
  process.exit(1);
}
console.log(`Provider-managed backup gate PASS: createdAt=${createdAt}, ageHours=${ageHours.toFixed(2)}`);
