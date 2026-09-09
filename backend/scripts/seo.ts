import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { OpenAiProvider } from '../src/ai/providers/openai.provider';
import { SeoService } from '../src/seo/seo.service';
import { BacklinkResearchService } from '../src/seo/backlink-research.service';
async function main() {
  const db = new PrismaService();
  try {
    const seo = new SeoService(db); const research = new BacklinkResearchService(db, new OpenAiProvider(new ConfigService()), seo);
    const action = process.argv[2];
    const result = action === 'audit' ? await seo.audit() : action === 'research' ? await research.research(process.argv.slice(3).join(' ')) : action === 'overview' ? await seo.overview() : action === 'opportunities' ? await research.list() : null;
    if (!result) throw new Error('Usage: seo.ts audit|overview|opportunities|research <query>');
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } finally { await db.$disconnect(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
