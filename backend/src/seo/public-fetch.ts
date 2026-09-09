import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { request as httpRequest } from 'node:http';
import ipaddr from 'ipaddr.js';
import robotsParser from 'robots-parser';
export function publicUrl(input: string): URL {
  const url = new URL(input);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port))) throw new Error('Only public HTTP(S) pages on standard ports are allowed');
  url.hash = ''; return url;
}
export function isPublicAddress(address: string) { try { return ipaddr.process(address).range() === 'unicast'; } catch { return false; } }
export type PublicPage = { url: string; status: number; html: string; headers: Record<string, string | string[] | undefined> };
const agentName = 'VomamSeoBot';
// Pin validated DNS for the connection; validate again on each redirect.
async function requestPage(url: URL): Promise<PublicPage> {
  const addresses = await lookup(url.hostname.replace(/^\[|\]$/g, ''), { all: true });
  if (!addresses.length || addresses.some(x => !isPublicAddress(x.address))) throw new Error('Private or reserved address blocked');
  const address = addresses[0];
  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? request : httpRequest)(url, {
      family: address.family,
      headers: { 'User-Agent': `${agentName}/1.0 (+https://www.vomamxenang.com)`, Accept: 'text/html,text/plain,application/xml' },
      lookup: (_host, _options, callback) => callback(null, address.address, address.family),
    }, res => {
      let bytes = 0; const chunks: Buffer[] = [];
      res.on('data', chunk => { bytes += chunk.length; if (bytes > 3_000_000) { req.destroy(new Error('Page exceeds 3 MB')); return; } chunks.push(chunk); });
      res.on('error', reject);
      res.on('end', () => resolve({ url: url.href, status: res.statusCode || 0, headers: res.headers, html: Buffer.concat(chunks).toString('utf8') }));
    });
    const timer = setTimeout(() => req.destroy(new Error('Public fetch timed out')), 12000);
    req.on('close', () => clearTimeout(timer)); req.on('error', reject); req.end();
  });
}
export async function fetchPublic(input: string, respectRobots = true, depth = 0): Promise<PublicPage> {
  if (depth > 4) throw new Error('Too many redirects');
  const url = publicUrl(input);
  if (respectRobots) {
    const robotUrl = new URL('/robots.txt', url);
    const robots = await fetchPublic(robotUrl.href, false);
    if (robots.status !== 404) {
      if (robots.status !== 200) throw new Error(`robots.txt unavailable (${robots.status}); manual review required`);
      const parser = robotsParser(robotUrl.href, robots.html);
      if (parser.isAllowed(url.href, agentName) === false) throw new Error('robots.txt disallows this page');
      if ((parser.getCrawlDelay(agentName) || 0) > 0) throw new Error('Site requires crawl delay; manual review required');
    }
  }
  const result = await requestPage(url);
  if (result.status >= 300 && result.status < 400 && result.headers.location) return fetchPublic(new URL(String(result.headers.location), url).href, respectRobots, depth + 1);
  if ([401, 403, 429].includes(result.status) || /<title[^>]*>[^<]*(?:just a moment|access denied|captcha)/i.test(result.html)) throw new Error(`Access restricted (${result.status}); no retry or bypass`);
  return result;
}
