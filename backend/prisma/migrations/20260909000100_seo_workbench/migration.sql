-- CreateEnum
CREATE TYPE "BacklinkOpportunityType" AS ENUM ('FORUM', 'BUSINESS_DIRECTORY', 'INDUSTRY_DIRECTORY', 'B2B_MARKETPLACE', 'BLOG', 'NEWS', 'GUEST_POST', 'SUPPLIER', 'PARTNER', 'ASSOCIATION', 'COMMUNITY', 'SOCIAL_PROFILE', 'LOCAL_CITATION', 'RESOURCE_PAGE');

-- CreateEnum
CREATE TYPE "BacklinkStatus" AS ENUM ('DISCOVERED', 'REVIEWING', 'APPROVED', 'CONTACTED', 'SUBMITTED', 'LIVE', 'REJECTED', 'REMOVED');

-- CreateTable
CREATE TABLE "SeoAudit" (
    "id" TEXT NOT NULL,
    "report" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalLinkSuggestion" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchorText" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalLinkSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacklinkOpportunity" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BacklinkOpportunityType" NOT NULL,
    "relevanceScore" INTEGER,
    "authorityScore" INTEGER,
    "spamRiskScore" INTEGER,
    "supportsRegistration" BOOLEAN,
    "supportsPosting" BOOLEAN,
    "supportsProfileLink" BOOLEAN,
    "supportsGuestPost" BOOLEAN,
    "contactUrl" TEXT,
    "contactEmail" TEXT,
    "status" "BacklinkStatus" NOT NULL DEFAULT 'DISCOVERED',
    "notes" TEXT,
    "evidence" TEXT NOT NULL,
    "evidenceUrl" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "suggestedTargetUrl" TEXT NOT NULL,
    "suggestedAnchorTexts" TEXT[],
    "suggestedApproach" TEXT NOT NULL,
    "risk" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "requiresManualReview" BOOLEAN NOT NULL DEFAULT true,
    "outreach" JSONB,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BacklinkOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backlink" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceDomain" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchorText" TEXT,
    "rel" TEXT,
    "firstSeenAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "verificationNote" TEXT,

    CONSTRAINT "Backlink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InternalLinkSuggestion_sourceType_sourceId_targetType_targe_key" ON "InternalLinkSuggestion"("sourceType", "sourceId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "BacklinkOpportunity_status_relevanceScore_idx" ON "BacklinkOpportunity"("status", "relevanceScore");

-- CreateIndex
CREATE UNIQUE INDEX "BacklinkOpportunity_domain_url_key" ON "BacklinkOpportunity"("domain", "url");

-- CreateIndex
CREATE UNIQUE INDEX "Backlink_sourceUrl_targetUrl_key" ON "Backlink"("sourceUrl", "targetUrl");

-- AddForeignKey
ALTER TABLE "Backlink" ADD CONSTRAINT "Backlink_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "BacklinkOpportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

