-- TASK-0003 safe additive repair.
-- AssemblyLog is used by current runtime but absent from historical migration lineage.
CREATE TABLE IF NOT EXISTS "AssemblyLog" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "wheelRimId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "pressingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssemblyLog_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AssemblyLog_productId_fkey') THEN
    ALTER TABLE "AssemblyLog" ADD CONSTRAINT "AssemblyLog_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AssemblyLog_wheelRimId_fkey') THEN
    ALTER TABLE "AssemblyLog" ADD CONSTRAINT "AssemblyLog_wheelRimId_fkey"
      FOREIGN KEY ("wheelRimId") REFERENCES "WheelRim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
