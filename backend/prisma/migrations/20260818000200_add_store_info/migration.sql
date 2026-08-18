CREATE TABLE "StoreInfo" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "website" TEXT,
  "taxCode" TEXT,
  "logoUrl" TEXT,
  "facebookUrl" TEXT,
  "businessHours" TEXT,
  "notes" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreInfo_pkey" PRIMARY KEY ("id")
);
