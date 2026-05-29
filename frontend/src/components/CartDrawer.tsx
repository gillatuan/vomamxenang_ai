"use client";

import {
  Drawer,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCartStore } from "@/store/cart";
import { ordersAPI } from "@/lib/api-client";
import { useState } from "react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, clear } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const checkoutData = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.sellingPrice || 0,
      }));

      const res = await ordersAPI.createCheckoutSession(checkoutData);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, padding: "2rem" }}>
        <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
          Giỏ hàng ({items.length})
        </Typography>

        {error && <Alert severity="error" sx={{ marginBottom: "1rem" }}>{error}</Alert>}

        {items.length === 0 ? (
          <Typography color="textSecondary">Giỏ hàng trống</Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ marginBottom: "2rem" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Giá</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, Number(e.target.value))
                          }
                          style={{ width: "50px" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {(item.sellingPrice ? item.sellingPrice * item.quantity : 0).toLocaleString()} ₫
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => removeItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ marginBottom: "2rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
              <Typography variant="h6">
                Tổng: {total().toLocaleString()} ₫
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: "1rem" }}>
              <Button variant="outlined" fullWidth onClick={onClose}>
                Tiếp tục
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : "Thanh toán"}
              </Button>
            </Box>

            <Button
              fullWidth
              variant="text"
              color="error"
              sx={{ marginTop: "1rem" }}
              onClick={clear}
            >
              Xóa tất cả
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
