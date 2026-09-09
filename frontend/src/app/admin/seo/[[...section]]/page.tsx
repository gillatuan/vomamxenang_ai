'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { apiClient } from '@/lib/api';

type Issue = { code: string; severity: string; detail: string };
type PageAudit = { id?: string; kind: string; path: string; title: string; score: number; issues: Issue[]; incoming: string[]; contextualIncoming: string[] };
type Keyword = { keyword: string; intent: string; primaryUrl: string; supportingUrls: string[]; competingPrimaryUrls: string[] };
type Overview = { audit?: { createdAt: string; report: { pages: PageAudit[]; issues: Record<string, number>; unchecked: { path: string; error: string }[] } }; opportunities: number; suggestions: number; live: number; keywordMap: Keyword[] };
type Suggestion = { id: string; sourceType: string; sourceId: string; sourceUrl: string; targetUrl: string; anchorText: string; reason: string; score: number; status: string };
type Opportunity = { id: string; name: string; domain: string; url: string; type: string; relevanceScore: number | null; authorityScore: number | null; spamRiskScore: number | null; status: string; evidence: string; evidenceUrl: string; suggestedTargetUrl: string; suggestedAnchorTexts: string[]; suggestedApproach: string; contactUrl?: string; contactEmail?: string; notes?: string; risk: string; lastCheckedAt?: string; details: Record<string, unknown>; outreach?: Record<string, unknown>; backlinks: Record<string, unknown>[]; supportsRegistration: boolean | null; supportsPosting: boolean | null; supportsGuestPost: boolean | null; supportsProfileLink: boolean | null };
const sections = [['', 'Tổng quan'], ['products', 'Products'], ['posts', 'Posts'], ['internal-links', 'Internal Links'], ['backlinks', 'Backlink Opportunities']];
const display = (value: unknown) => value === null || value === undefined ? 'UNKNOWN' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
export default function SeoWorkbench({ params }: { params: { section?: string[] } }) {
  const section = params.section?.[0] || '';
  const [overview, setOverview] = useState<Overview>(); const [links, setLinks] = useState<Suggestion[]>([]); const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Opportunity>(); const [notes, setNotes] = useState(''); const [sourceUrl, setSourceUrl] = useState(''); const [filter, setFilter] = useState('');
  const [query, setQuery] = useState('xe nâng logistics Việt Nam danh bạ doanh nghiệp diễn đàn đóng góp kỹ thuật');
  const refresh = useCallback(async () => {
    const [a, b, c] = await Promise.all([apiClient.get<Overview>('/admin/seo'), apiClient.get<Suggestion[]>('/admin/seo/internal-links'), apiClient.get<Opportunity[]>('/admin/seo/opportunities')]);
    setOverview(a.data); setLinks(b.data); setOpportunities(c.data); return c.data;
  }, []);
  useEffect(() => { refresh().catch(() => setError('Không tải được SEO. Kiểm tra đăng nhập admin và migration backend.')); }, [refresh]);
  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true); setError(''); setMessage('');
    try { await action(); const rows = await refresh(); if (selected) setSelected(rows.find(r => r.id === selected.id)); setMessage(success); }
    catch (err) { const e = err as { response?: { data?: { message?: string | string[] } } }; setError(String(e.response?.data?.message || 'Không thực hiện được; vui lòng thử lại.')); }
    finally { setBusy(false); }
  };
  const review = (status: string) => selected && run(() => apiClient.patch(`/admin/seo/opportunities/${selected.id}`, { status, notes }), 'Đã cập nhật trạng thái.');
  const pages = overview?.audit?.report.pages || [];
  const filteredPages = pages.filter(p => section === 'products' ? p.kind === 'PRODUCT' : section === 'posts' ? p.kind === 'POST' : true);
  return <Stack spacing={3}>
    <Typography variant="h4" component="h1">SEO Workbench</Typography>
    <Stack direction="row" gap={1} flexWrap="wrap">{sections.map(([path, label]) => <Button key={path} component={Link} href={`/admin/seo${path ? '/' + path : ''}`} variant={section === path ? 'contained' : 'outlined'}>{label}</Button>)}</Stack>
    {error && <Alert severity="error">{error}</Alert>}{message && <Alert severity="success">{message}</Alert>}{busy && <CircularProgress size={24} />}
    {!overview && !error && <CircularProgress />}
    {section !== 'backlinks' && section !== 'internal-links' && <>
      <Stack direction="row" spacing={2}><Button disabled={busy} variant="contained" onClick={() => run(() => apiClient.post('/admin/seo/audit'), 'Đã audit HTML public và cập nhật gợi ý. Không sửa nội dung.')}>Chạy audit website</Button><Button component={Link} href="/admin/ai/seo">AI SEO · Xem trước và duyệt</Button></Stack>
      <Typography variant="body2">Audit gần nhất: {overview?.audit ? new Date(overview.audit.createdAt).toLocaleString('vi-VN') : 'Chưa chạy'}. Điểm là checklist kỹ thuật nội bộ, không phải thứ hạng Google.</Typography>
      {!section && <>
        <Alert severity="info">Search Console API chưa kết nối. Chưa có dữ liệu clicks, impressions, CTR hoặc vị trí. Category hiện là danh mục kho; trang danh mục công khai là /products.</Alert>
        <Stack direction="row" gap={1} flexWrap="wrap">{Object.entries(overview?.audit?.report.issues || {}).map(([severity, count]) => <Chip key={severity} label={`${severity}: ${count}`} />)}<Chip label={`Cơ hội: ${overview?.opportunities || 0}`} /><Chip label={`Backlink LIVE: ${overview?.live || 0}`} /><Chip label={`Gợi ý chờ duyệt: ${overview?.suggestions || 0}`} /></Stack>
      </>}
      {!!overview?.audit?.report.unchecked.length && <Alert severity="warning">Chưa kiểm tra được: {overview.audit.report.unchecked.map(x => `${x.path}: ${x.error}`).join('; ')}</Alert>}
      <Box sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>{['Trang', 'Điểm', 'Liên kết tới / trong mô tả', 'Vấn đề', 'Chỉnh sửa'].map(x => <TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{filteredPages.map(page => <TableRow key={page.path}>
        <TableCell><a href={page.path} target="_blank" rel="noreferrer">{page.title || page.path}</a></TableCell><TableCell>{page.score}/100</TableCell><TableCell>{page.incoming.length} / {page.contextualIncoming.length}</TableCell>
        <TableCell>{page.issues.map((issue, i) => <Typography variant="body2" key={i}>{issue.severity} · {issue.code}: {issue.detail}</Typography>)}</TableCell><TableCell>{page.id && <Button component={Link} href={page.kind === 'PRODUCT' ? '/admin/inventory/products' : '/admin/content/posts'}>Mở editor</Button>}</TableCell>
      </TableRow>)}</TableBody></Table></Box>
      {!section && <><Typography variant="h5">Keyword map & topic clusters · đề xuất</Typography><Typography>Từ khóa size/brand lấy từ DB. URL chính là đề xuất; admin duyệt qua AI Studio/editor. Supporting URLs có nhiệm vụ dẫn tới trang chính.</Typography><Box sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow><TableCell>Keyword / intent</TableCell><TableCell>Primary URL</TableCell><TableCell>Supporting URLs</TableCell><TableCell>Cạnh tranh từ khóa chính</TableCell></TableRow></TableHead><TableBody>{overview?.keywordMap.map(row => <TableRow key={row.keyword}><TableCell>{row.keyword}<br />{row.intent}</TableCell><TableCell><a href={row.primaryUrl}>{new URL(row.primaryUrl).pathname}</a></TableCell><TableCell><details><summary>{row.supportingUrls.length} trang</summary>{row.supportingUrls.map(url => <p key={url}><a href={url}>{new URL(url).pathname}</a></p>)}</details></TableCell><TableCell>{row.competingPrimaryUrls.join(', ') || 'Chưa phát hiện'}</TableCell></TableRow>)}</TableBody></Table></Box></>}
    </>}
    {section === 'internal-links' && <>
      <Alert severity="info">Duyệt gợi ý rồi mở editor để chèn anchor tự nhiên và lưu. Hệ thống không tự sửa mô tả. Chạy audit để tạo gợi ý mới.</Alert>
      <Box sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>{['Source → Target', 'Anchor đề xuất', 'Lý do / điểm', 'Trạng thái', 'Duyệt'].map(x => <TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{links.map(link => <TableRow key={link.id}><TableCell><a href={link.sourceUrl}>{new URL(link.sourceUrl).pathname}</a><br />→ <a href={link.targetUrl}>{new URL(link.targetUrl).pathname}</a></TableCell><TableCell>{link.anchorText}</TableCell><TableCell>{link.reason}<br />{link.score}/100</TableCell><TableCell>{link.status}</TableCell><TableCell><Button disabled={busy} onClick={() => run(() => apiClient.patch(`/admin/seo/internal-links/${link.id}`, { status: 'APPROVED' }), 'Đã duyệt; mở editor để áp dụng.')}>Duyệt</Button><Button disabled={busy} onClick={() => run(() => apiClient.patch(`/admin/seo/internal-links/${link.id}`, { status: 'REJECTED' }), 'Đã từ chối.')}>Từ chối</Button><Button component={Link} href={link.sourceType === 'PRODUCT' ? '/admin/inventory/products' : '/admin/content/posts'}>Editor</Button></TableCell></TableRow>)}</TableBody></Table></Box>
    </>}
    {section === 'backlinks' && <>
      <Alert severity="info">Cơ hội chưa phải backlink. Chỉ đánh dấu LIVE khi tìm thấy liên kết và trang đích truy cập được. Nghiên cứu dùng web search qua AI đã cấu hình; có thể mất vài phút.</Alert>
      <TextField label="Truy vấn nghiên cứu mới" value={query} onChange={e => setQuery(e.target.value)} /><Button disabled={busy || !query.trim()} variant="contained" onClick={() => run(async () => { const { data } = await apiClient.post<{ results: unknown[]; skipped: { url: string; reason: string }[] }>('/admin/seo/research', { query }); if (!data.results.length) throw { response: { data: { message: `Không có cơ hội đủ bằng chứng để lưu. ${data.skipped.map(x => x.reason).join('; ')}` } } }; }, 'Đã tìm kiếm web và lưu cơ hội có bằng chứng. Xem và duyệt từng website.')}>Nghiên cứu web hiện tại</Button>
      <TextField label="Lọc website, loại hoặc trạng thái" value={filter} onChange={e => setFilter(e.target.value)} />
      <Box sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>{['Website', 'Loại', 'Relevance', 'Target page', 'Cơ hội', 'Trạng thái', 'Last checked', 'Actions'].map(x => <TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{opportunities.filter(o => `${o.name} ${o.domain} ${o.type} ${o.status}`.toLowerCase().includes(filter.toLowerCase())).map(row => <TableRow key={row.id}><TableCell><a href={row.url} target="_blank" rel="noreferrer">{row.name}</a><br />{row.domain}</TableCell><TableCell>{row.type}</TableCell><TableCell>{display(row.relevanceScore)}</TableCell><TableCell><a href={row.suggestedTargetUrl}>{new URL(row.suggestedTargetUrl).pathname}</a></TableCell><TableCell>{row.suggestedApproach}</TableCell><TableCell>{row.status}</TableCell><TableCell>{row.lastCheckedAt ? new Date(row.lastCheckedAt).toLocaleDateString('vi-VN') : 'Chưa kiểm tra'}</TableCell><TableCell><Button onClick={() => { setSelected(row); setNotes(row.notes || ''); setSourceUrl(row.url); }}>Xem / Duyệt</Button></TableCell></TableRow>)}</TableBody></Table></Box>
    </>}
    <Dialog open={!!selected} onClose={() => !busy && setSelected(undefined)} maxWidth="md" fullWidth><DialogTitle>{selected?.name} · {selected?.status}</DialogTitle><DialogContent>{selected && <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}{message && <Alert severity="success">{message}</Alert>}
      <Typography>{selected.evidence}</Typography><a href={selected.evidenceUrl} target="_blank" rel="noreferrer">Nguồn chứng minh</a><Typography>{selected.suggestedApproach}</Typography><Typography>Target: {selected.suggestedTargetUrl}<br />Anchors: {selected.suggestedAnchorTexts.join(' · ')}</Typography>
      <Typography>DA: {display(selected.authorityScore)} · Spam score: {display(selected.spamRiskScore)} · Risk: {selected.risk}</Typography>
      <Typography>Registration: {display(selected.supportsRegistration)} · Posting: {display(selected.supportsPosting)} · Profile link: {display(selected.supportsProfileLink)} · Guest contribution: {display(selected.supportsGuestPost)}</Typography>
      <Typography>Liên hệ: {selected.contactEmail || 'UNKNOWN'} {selected.contactUrl && <a href={selected.contactUrl}>{selected.contactUrl}</a>}</Typography>
      <details><summary>Phân tích, chính sách, hoạt động & bằng chứng</summary><Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{display(selected.details)}</Box></details>
      <TextField label="Ghi chú khi chuyển trạng thái" value={notes} onChange={e => setNotes(e.target.value)} multiline />
      <Stack direction="row" gap={1} flexWrap="wrap"><Button disabled={busy} onClick={() => run(() => apiClient.post(`/admin/seo/opportunities/${selected.id}/analyze`), 'Đã kiểm tra; xem kết quả hoặc giới hạn truy cập trong phân tích.')}>Analyze</Button>{['DISCOVERED', 'REVIEWING'].includes(selected.status) && <Button disabled={busy || selected.risk === 'HIGH'} onClick={() => review('APPROVED')}>Approve</Button>}{!['REJECTED', 'REMOVED', 'LIVE'].includes(selected.status) && <Button disabled={busy} onClick={() => review('REJECTED')}>Reject</Button>}{['REJECTED', 'REMOVED'].includes(selected.status) && <Button disabled={busy} onClick={() => review('REVIEWING')}>Review again</Button>}{selected.status === 'APPROVED' && <Button disabled={busy} onClick={() => review('CONTACTED')}>Mark contacted</Button>}{selected.status === 'CONTACTED' && <Button disabled={busy} onClick={() => review('SUBMITTED')}>Mark submitted</Button>}
      <Button disabled={busy || !['APPROVED', 'CONTACTED', 'SUBMITTED'].includes(selected.status)} onClick={() => run(() => apiClient.post(`/admin/seo/opportunities/${selected.id}/outreach`), 'Đã tạo bản nháp. Admin tự kiểm tra và gửi nếu phù hợp.')}>Generate outreach draft</Button></Stack>
      {selected.outreach && <Box sx={{ bgcolor: 'grey.100', p: 2 }}>{Object.entries(selected.outreach).map(([key, value]) => <Box key={key} sx={{ mb: 2 }}><Typography fontWeight={700}>{key}</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{display(value)}</Typography></Box>)}</Box>}
      <TextField label="URL nguồn thực tế để xác minh backlink" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} /><Button disabled={busy || !sourceUrl || !['APPROVED', 'CONTACTED', 'SUBMITTED', 'LIVE', 'REMOVED'].includes(selected.status)} onClick={() => run(() => apiClient.post(`/admin/seo/opportunities/${selected.id}/verify`, { sourceUrl }), 'Đã xác minh; xem isLive và verificationNote bên dưới.')}>Verify backlink</Button>
      {selected.backlinks.map((b, i) => <Box key={i} component="pre" sx={{ whiteSpace: 'pre-wrap' }}>{display(b)}</Box>)}
    </Stack>}</DialogContent></Dialog>
  </Stack>;
}
