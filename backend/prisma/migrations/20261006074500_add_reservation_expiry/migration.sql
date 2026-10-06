ALTER TABLE "StockReservation" ADD COLUMN "expiresAt" TIMESTAMP(3);
CREATE INDEX "StockReservation_status_expiresAt_idx" ON "StockReservation"("status", "expiresAt");
