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
  Link as MuiLink,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, clear } = useCartStore();
  const router = useRouter();
  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    onClose();
    router.push("/checkout");
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, padding: "2rem" }}>
        <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
          Giỏ hàng ({items.length})
        </Typography>

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
                      <TableCell><MuiLink component={NextLink} href={`/products/${item.slug || item.id}`} onClick={onClose}>{item.name}</MuiLink></TableCell>
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
              >
                Thanh toán
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
