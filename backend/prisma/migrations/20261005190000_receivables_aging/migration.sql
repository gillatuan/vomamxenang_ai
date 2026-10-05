ALTER TABLE "Order" ADD COLUMN "paymentDueAt" TIMESTAMP(3);
CREATE INDEX "Order_paymentDueAt_status_idx" ON "Order"("paymentDueAt", "status");
