ALTER TABLE "QuoteLead"
  ADD COLUMN "assigneeId" TEXT,
  ADD COLUMN "followUpAt" TIMESTAMP(3),
  ADD COLUMN "lastContactAt" TIMESTAMP(3);

CREATE TABLE "QuoteLeadActivity" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'NOTE',
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteLeadActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuoteLead_assigneeId_status_idx" ON "QuoteLead"("assigneeId", "status");
CREATE INDEX "QuoteLead_followUpAt_status_idx" ON "QuoteLead"("followUpAt", "status");
CREATE INDEX "QuoteLeadActivity_leadId_createdAt_idx" ON "QuoteLeadActivity"("leadId", "createdAt");
CREATE INDEX "QuoteLeadActivity_userId_createdAt_idx" ON "QuoteLeadActivity"("userId", "createdAt");

ALTER TABLE "QuoteLead" ADD CONSTRAINT "QuoteLead_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuoteLeadActivity" ADD CONSTRAINT "QuoteLeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "QuoteLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteLeadActivity" ADD CONSTRAINT "QuoteLeadActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
