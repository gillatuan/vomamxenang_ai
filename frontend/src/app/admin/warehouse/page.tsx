"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useEffect, useMemo, useRef, useState } from "react";

interface Slot {
  code: string;
  segment: string;
  occupancy: number;
  product: string;
  capacity: number;
  details: string;
}

const rackMap: Slot[] = [
  { code: "K1-A-01-01", segment: "Khu A / R1", occupancy: 0.72, product: "Lốp 6.00-9 Casumina", capacity: 120, details: "Vị trí 1, lô sản phẩm xe nâng 6.00-9." },
  { code: "K1-A-01-02", segment: "Khu A / R1", occupancy: 0.18, product: "Mâm 6.00-9 6 lỗ", capacity: 50, details: "Lưu trữ mâm xe nâng, kiểm tra ốc vít." },
  { code: "K1-B-02-03", segment: "Khu B / R2", occupancy: 0.95, product: "Lốp 7.00-12", capacity: 110, details: "Tồn kho cao, cần lên kế hoạch bán chạy." },
  { code: "K2-C-03-05", segment: "Khu C / R3", occupancy: 0.42, product: "Mâm 7.00-12 8 lỗ", capacity: 60, details: "Vị trí chứa mâm dự phòng, có bảo vệ." },
];

const formatOccupancy = (value: number) => `${Math.round(value * 100)}%`;

export default function WarehouseMapPage() {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    if (!scannerOpen) {
      stopCamera();
      return;
    }

    const startCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        trackRef.current = stream.getVideoTracks()[0];

        if ((window as any).BarcodeDetector) {
          const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
          const scanLoop = async () => {
            if (!videoRef.current || videoRef.current.readyState !== 4) {
              requestAnimationFrame(scanLoop);
              return;
            }
            try {
              const detections = await detector.detect(videoRef.current);
              if (detections?.length) {
                const code = detections[0].rawValue;
                setScannedCode(code);
                const foundSlot = rackMap.find((slot) => slot.code === code);
                if (foundSlot) {
                  setSelectedSlot(foundSlot);
                }
              }
            } catch (error) {
              setScanError("Không thể đọc mã QR từ camera.");
            }
            requestAnimationFrame(scanLoop);
          };
          requestAnimationFrame(scanLoop);
        }
      } catch (error) {
        setScanError("Không thể mở camera. Vui lòng cấp quyền hoặc thử lại.");
      }
    };

    startCapture();

    return () => stopCamera();
  }, [scannerOpen]);

  const stopCamera = () => {
    if (trackRef.current) {
      trackRef.current.stop();
      trackRef.current = null;
    }
  };

  const highlighted = useMemo(
    () => rackMap.map((slot) => ({ ...slot, isActive: slot.code === scannedCode })),
    [scannedCode]
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Sơ đồ kho và bản đồ kho lưu trữ
          </Typography>
          <Typography color="textSecondary">
            Xem trạng thái kho theo từng vị trí, quét mã QR vị trí để tra cứu nhanh.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<QrCodeScannerIcon />} onClick={() => setScannerOpen(true)}>
          Quét mã vị trí
        </Button>
      </Box>

      <Grid container spacing={2}>
        {highlighted.map((slot) => (
          <Grid item xs={12} sm={6} md={4} key={slot.code}>
            <Tooltip title={slot.details}>
              <Card
                onClick={() => setSelectedSlot(slot)}
                sx={{
                  cursor: "pointer",
                  border: slot.code === scannedCode ? "2px solid #F57C00" : "1px solid rgba(0,0,0,0.08)",
                  transition: "transform 180ms ease",
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        {slot.segment}
                      </Typography>
                      <Typography variant="h6">{slot.code}</Typography>
                    </Box>
                    <LocationOnIcon color={slot.occupancy > 0.85 ? "error" : slot.occupancy > 0.5 ? "warning" : "success"} />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {slot.product}
                  </Typography>
                  <LinearProgress variant="determinate" value={slot.occupancy * 100} sx={{ height: 10, borderRadius: 5 }} />
                  <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                    Mức độ lấp đầy: {formatOccupancy(slot.occupancy)} / {slot.capacity} đơn vị
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quét mã QR vị trí kho</DialogTitle>
        <DialogContent>
          {scanError && <Typography color="error" sx={{ mb: 2 }}>{scanError}</Typography>}
          <video ref={videoRef} style={{ width: "100%", borderRadius: 8, backgroundColor: "#000" }} playsInline muted />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Mã đã quét: <strong>{scannedCode || "Chưa có"}</strong>
            </Typography>
            <TextField
              label="Nhập mã vị trí thủ công"
              fullWidth
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualCode.trim()) {
                  const found = rackMap.find((slot) => slot.code === manualCode.trim());
                  if (found) {
                    setSelectedSlot(found);
                    setScannedCode(found.code);
                  }
                }
              }}
            />
          </Box>
          <List>
            {selectedSlot ? (
              <ListItem>
                <ListItemText
                  primary={`Vị trí hiện chọn: ${selectedSlot.code}`}
                  secondary={selectedSlot.details}
                />
              </ListItem>
            ) : (
              <ListItem>
                <ListItemText primary="Chưa chọn vị trí nào" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScannerOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedSlot)} onClose={() => setSelectedSlot(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết vị trí kho</DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {selectedSlot.segment}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedSlot.code}
              </Typography>
              <Typography sx={{ mb: 2 }}>{selectedSlot.details}</Typography>
              <Typography variant="body2">Sản phẩm: {selectedSlot.product}</Typography>
              <Typography variant="body2">Tỷ lệ lấp đầy: {formatOccupancy(selectedSlot.occupancy)}</Typography>
              <Typography variant="body2">Sức chứa: {selectedSlot.capacity}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSlot(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
