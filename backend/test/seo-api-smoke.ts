import 'reflect-metadata';
import assert from 'node:assert/strict';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../src/auth/constants';
async function main() {
  const endpoint = 'http://localhost:3001/api/v1/admin/seo';
  assert.equal((await fetch(endpoint)).status, 401);
  const jwt = new JwtService({ secret: jwtConstants.secret });
  const headers = (role: string) => ({ Authorization: `Bearer ${jwt.sign({ sub: 'seo-local-smoke', role }, { expiresIn: '2m' })}` });
  assert.equal((await fetch(endpoint, { headers: headers('STOREKEEPER') })).status, 403);
  const response = await fetch(endpoint, { headers: headers('ADMIN_MANAGER') }); assert.equal(response.status, 200);
  const data = await response.json() as { opportunities: number; keywordMap: unknown[]; searchConsole: { connected: boolean } }; assert(data.opportunities >= 10); assert(data.keywordMap.length); assert.equal(data.searchConsole.connected, false);
  const opportunities = await fetch(endpoint + '/opportunities', { headers: headers('ADMIN_MANAGER') }); assert.equal(opportunities.status, 200);
  console.log('SEO admin HTTP smoke: anonymous 401, storekeeper 403, admin 200; persisted opportunities and real keyword map.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
