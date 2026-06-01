-- Create missing tables required for seed compatibility.

CREATE TABLE IF NOT EXISTS "WheelRim" (
  "id" text PRIMARY KEY,
  "sku" text NOT NULL UNIQUE,
  "size" text NOT NULL,
  "boltHoles" integer NOT NULL,
  "compatibleModels" text,
  "brand" text,
  "importPrice" double precision NOT NULL,
  "sellingPrice" double precision,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Location" (
  "id" text PRIMARY KEY,
  "warehouseId" text NOT NULL,
  "zone" text NOT NULL,
  "rack" text NOT NULL,
  "slot" text NOT NULL,
  "locationCode" text NOT NULL UNIQUE,
  "capacity" integer NOT NULL DEFAULT 50,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "Location_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "StockLocation" (
  "id" text PRIMARY KEY,
  "locationId" text NOT NULL,
  "productId" text,
  "wheelRimId" text,
  "quantity" integer NOT NULL DEFAULT 0,
  CONSTRAINT "StockLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE,
  CONSTRAINT "StockLocation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL,
  CONSTRAINT "StockLocation_wheelRimId_fkey" FOREIGN KEY ("wheelRimId") REFERENCES "WheelRim"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "StockLocation_location_product_wheel_unique" ON "StockLocation"("locationId", "productId", "wheelRimId");

CREATE TABLE IF NOT EXISTS "PriceMatrix" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" text NOT NULL,
  "customerType" text NOT NULL,
  "price" double precision NOT NULL,
  CONSTRAINT "PriceMatrix_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PriceMatrix_product_customer_unique" ON "PriceMatrix"("productId", "customerType");
