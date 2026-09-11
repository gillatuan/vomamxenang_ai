import Link from 'next/link';
import type { Crumb } from '@/lib/seo/structured-data';
export function SeoBreadcrumbs({ items }: { items: Crumb[] }) {
  return <nav aria-label="Đường dẫn" style={{ marginBottom: 24 }}><ol style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 0, listStyle: 'none' }}>{items.map((item, i) => <li key={item.path}>{i > 0 && <span aria-hidden="true"> / </span>}{i === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}</li>)}</ol></nav>;
}
