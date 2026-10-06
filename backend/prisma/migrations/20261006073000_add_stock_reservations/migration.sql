CREATE TYPE "StockReservationStatus" AS ENUM ('ACTIVE', 'CONSUMED', 'RELEASED');

CREATE TABLE "StockReservation" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "wheelRimId" TEXT,
  "locationId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "status" "StockReservationStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "consumedAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockReservation_orderId_productId_wheelRimId_locationId_key" ON "StockReservation"("orderId", "productId", "wheelRimId", "locationId");
CREATE INDEX "StockReservation_locationId_productId_wheelRimId_status_idx" ON "StockReservation"("locationId", "productId", "wheelRimId", "status");
CREATE INDEX "StockReservation_orderId_status_idx" ON "StockReservation"("orderId", "status");

ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_wheelRimId_fkey" FOREIGN KEY ("wheelRimId") REFERENCES "WheelRim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_quantity_check" CHECK ("quantity" > 0);
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_item_check" CHECK ((("productId" IS NOT NULL)::int + ("wheelRimId" IS NOT NULL)::int) = 1);
