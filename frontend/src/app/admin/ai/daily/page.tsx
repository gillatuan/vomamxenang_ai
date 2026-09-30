"use client";

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { dailyContentAPI, type DailyContentRun } from '@/lib/api-client';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function DailyContentPage() {
  const [run, setRun] = useState<DailyContentRun | null>(null); const [loading, setLoading] = useState(true); const [running, setRunning] = useState(false); const [error, setError] = useState('');
  const refresh = useCallback(async () => { setLoading(true); try { setRun((await dailyContentAPI.current()).data); setError(''); } catch { setError('Không thể tải daily content plan.'); } finally { setLoading(false); } }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const execute = async () => { setRunning(true); try { const result = (await dailyContentAPI.run()).data; setRun(result.run); setError(''); } catch { setError('Không thể chạy daily content job. Kiểm tra cấu hình AI và dữ liệu sản phẩm.'); } finally { setRunning(false); } };
  return <Box><AdminPageHeader title="AI · Daily SEO Content" /><Stack spacing={2}><Alert severity="info">Job chạy 06:00 mỗi ngày (Asia/Ho_Chi_Minh), lập đúng 2 chủ đề khác nhau và lưu Draft để duyệt trước khi publish.</Alert>{error && <Alert severity="error">{error}</Alert>}<Stack direction="row" spacing={1}><Button variant="contained" onClick={execute} disabled={running}>{running ? 'Đang chạy…' : 'Generate Daily 2 Posts'}</Button><Button onClick={refresh} disabled={loading || running}>Làm mới</Button></Stack>{run ? <><Typography>Ngày kế hoạch: <b>{run.runDate}</b> · <Chip size="small" label={run.status} /></Typography><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Bài viết / keyword</TableCell><TableCell>Cluster / intent</TableCell><TableCell>Sản phẩm</TableCell><TableCell>Trạng thái</TableCell></TableRow></TableHead><TableBody>{run.plans.map((plan) => <TableRow key={plan.id}><TableCell>{plan.slot}</TableCell><TableCell><b>{plan.title}</b><br /><Typography variant="caption">/{plan.slug} · {plan.primaryKeyword}</Typography></TableCell><TableCell>{plan.cluster}<br /><Typography variant="caption">{plan.searchIntent}</Typography></TableCell><TableCell>{plan.targetProduct?.name || '—'}</TableCell><TableCell><Chip size="small" color={plan.status === 'DRAFT' ? 'success' : plan.status === 'FAILED' ? 'error' : 'default'} label={plan.status} />{plan.failureReason && <Typography variant="caption" display="block">{plan.failureReason}</Typography>}</TableCell></TableRow>)}</TableBody></Table></> : !loading && <Alert severity="info">Chưa có daily content run.</Alert>}</Stack></Box>;
}
