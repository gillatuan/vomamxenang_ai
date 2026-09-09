"use client";

import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { postsAPI, productsAPI, SeoMetadata } from '@/lib/api-client';
import { linkRelatedContent, RelatedContent, slugify } from '@/lib/content-seo';
import { richTextPlain } from '@/lib/rich-text';

export default function ContentSeoFields({ id = '', kind, title, content, slug, seo, onChange, onContentChange }: {
  id?: string; kind: 'products' | 'blog'; title: string; content: string; slug: string; seo: SeoMetadata;
  onChange: (data: { slug: string; seo: SeoMetadata }) => void; onContentChange: (value: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const updateSeo = (data: Partial<SeoMetadata>) => onChange({ slug, seo: { ...seo, ...data } });
  const optimize = async () => {
    setBusy(true); setMessage(''); setFailed(false);
    try {
      const [products, posts] = await Promise.all([productsAPI.getAll(), postsAPI.getAll()]);
      const catalog: RelatedContent[] = [...products.data.map(item => ({ ...item, kind: 'products' as const })), ...posts.data.map(item => ({ ...item, kind: 'blog' as const }))];
      onContentChange(linkRelatedContent(content, catalog, { id, kind }));
      setMessage('Đã chèn liên kết cho các cụm từ phù hợp trong nội dung (tối đa 5). Bạn có thể kiểm tra trong editor trước khi lưu.');
    } catch { setFailed(true); setMessage('Không tải được nội dung liên quan. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  return <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, mb: 2 }}>
    <Typography fontWeight={700} sx={{ mb: 2 }}>SEO & đường dẫn</Typography>
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField fullWidth label="Alias (slug)" value={slug} placeholder={slugify(title)} onChange={event => onChange({ slug: event.target.value, seo })} onBlur={() => { if (slug) onChange({ slug: slugify(slug), seo }); }} helperText={`/${kind}/${slugify(slug || title) || 'alias'} · Để trống để tự tạo từ tên/tiêu đề. URL cũ vẫn chuyển hướng khi đổi alias.`} />
        <Button onClick={() => onChange({ slug: slugify(title), seo })}>Tạo từ tiêu đề</Button>
      </Stack>
      <TextField fullWidth label="Tiêu đề SEO" value={seo.title || ''} placeholder={title} onChange={event => updateSeo({ title: event.target.value })} />
      <TextField fullWidth multiline minRows={2} label="Mô tả tìm kiếm" value={seo.description || ''} placeholder={richTextPlain(content).slice(0, 160)} onChange={event => updateSeo({ description: event.target.value })} helperText={`${(seo.description || '').length} ký tự · Viết tóm tắt tự nhiên, rõ nội dung trang.`} />
      <TextField fullWidth label="Từ khóa chính" value={seo.primaryKeyword || ''} onChange={event => updateSeo({ primaryKeyword: event.target.value })} />
      <TextField fullWidth label="Từ khóa phụ" value={(seo.secondaryKeywords || []).join(',')} onChange={event => updateSeo({ secondaryKeywords: event.target.value.split(',') })} />
      {kind === 'blog' && <TextField fullWidth label="URL ảnh đại diện bài viết" value={seo.imageUrl || ''} onChange={event => updateSeo({ imageUrl: event.target.value })} helperText="Dùng ảnh thực tế mà bạn có quyền sử dụng." />}
      <TextField fullWidth label="Alt ảnh đại diện" value={seo.imageAlt || ''} onChange={event => updateSeo({ imageAlt: event.target.value })} helperText="Mô tả đúng hình ảnh; mặc định dùng tên sản phẩm." />
      <TextField fullWidth label="Từ khóa (phân cách bằng dấu phẩy)" value={(seo.keywords || []).join(',')} onChange={event => updateSeo({ keywords: event.target.value.split(',') })} helperText="Dùng cụm từ liên quan đến nội dung. Từ khóa cũng giúp gợi ý liên kết nội bộ." />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" onClick={() => updateSeo({ title: seo.title || title, description: seo.description || richTextPlain(content).slice(0, 160), keywords: [...new Set([title, ...(seo.keywords || [])].map(word => word.trim()).filter(Boolean))] })}>Điền SEO từ nội dung</Button>
        <Button variant="outlined" disabled={busy || !content} onClick={optimize}>{busy ? 'Đang tìm liên kết...' : 'Chèn liên kết liên quan vào mô tả'}</Button>
      </Stack>
      {message && <Alert severity={failed ? 'error' : 'info'}>{message}</Alert>}
    </Stack>
  </Box>;
}
