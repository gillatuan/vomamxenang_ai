import Link from 'next/link';
import { contentPath, RelatedContent } from '@/lib/content-seo';
export function RelatedContentNav({ items }: { items: RelatedContent[] }) {

  return <aside aria-label="Nội dung liên quan" style={{ marginTop: 32, padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
    <nav aria-label="Danh mục vỏ và mâm"><Link href="/vo-xe-nang">Danh mục vỏ xe nâng</Link> · <Link href="/mam-xe-nang">Đối chiếu mâm xe nâng</Link></nav>
    {(['products', 'blog'] as const).map(kind => {
      const group = items.filter(item => item.kind === kind);
      return group.length ? <section key={kind}><h2 style={{ fontSize: 20 }}>{kind === 'products' ? 'Sản phẩm liên quan' : 'Hướng dẫn liên quan'}</h2><ul>{group.map(item => <li key={item.id} style={{ marginBottom: 12 }}><Link href={contentPath(item, kind)}>{item.name || item.title}</Link></li>)}</ul></section> : null;
    })}
  </aside>;
}
