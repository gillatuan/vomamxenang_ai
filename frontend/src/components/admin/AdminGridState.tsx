import { Alert, CircularProgress, Typography } from "@mui/material";

export function AdminGridState({ loading, error, empty }: { loading: boolean; error: boolean; empty: boolean }) {
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Không thể tải dữ liệu. Vui lòng thử lại.</Alert>;
  if (empty) return <Typography color="text.secondary">Chưa có dữ liệu.</Typography>;
  return null;
}
