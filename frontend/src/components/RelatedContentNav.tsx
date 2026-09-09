import Link from 'next/link';
import { contentPath, RelatedContent } from '@/lib/content-seo';
export function RelatedContentNav({ items }: { items: RelatedContent[] }) {
  if (!items.length) return null;
  return <aside aria-label="Nội dung liên quan" style={{ marginTop: 32, padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
    {(['products', 'blog'] as const).map(kind => {
      const group = items.filter(item => item.kind === kind);
      return group.length ? <section key={kind}><h2 style={{ fontSize: 20 }}>{kind === 'products' ? 'Sản phẩm liên quan' : 'Hướng dẫn liên quan'}</h2><ul>{group.map(item => <li key={item.id} style={{ marginBottom: 12 }}><Link href={contentPath(item, kind)}>{item.name || item.title}</Link></li>)}</ul></section> : null;
    })}
  </aside>;
}
