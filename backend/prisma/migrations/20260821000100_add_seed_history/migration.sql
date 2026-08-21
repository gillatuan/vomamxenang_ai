CREATE TABLE "SeedHistory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeedHistory_key_key" ON "SeedHistory"("key");
