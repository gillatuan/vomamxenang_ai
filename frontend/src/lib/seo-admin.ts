import apiClient from '@/lib/api';
import type { ContentStatus, SeoMetadata } from '@/lib/api-client';

export type SeoContent = { id: string; name?: string; title?: string; slug?: string | null; imageUrl?: string | null; seo?: SeoMetadata | null; tags: string[]; status: ContentStatus; createdAt: string };
export type SeoKeyword = { id: string; keyword: string; type: KeywordType; intent: KeywordIntent; priority: number; cluster?: string | null; targetUrl: string; productId?: string | null; postId?: string | null; status: KeywordStatus; notes?: string | null; product?: { id: string; name: string; slug?: string | null } | null; post?: { id: string; title: string; slug?: string | null } | null };
export type KeywordType = 'PRIMARY' | 'SECONDARY' | 'SUPPORTING' | 'BRANDED' | 'LOCAL';
export type KeywordIntent = 'INFORMATIONAL' | 'NAVIGATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL';
export type KeywordStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type InternalLink = { id: string; sourceType: 'PRODUCT' | 'POST'; sourceId: string; targetType: 'PRODUCT' | 'POST'; targetId: string; sourceUrl: string; targetUrl: string; anchorText: string; reason: string; score: number; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED' };
export type CampaignPost = { id: string; postId: string; sortOrder: number; notes?: string | null; post: { id: string; title: string; slug?: string | null; status: ContentStatus } };
export type Campaign = { id: string; name: string; slug: string; description?: string | null; goal?: string | null; status: ContentStatus; startsAt?: string | null; endsAt?: string | null; posts: CampaignPost[] };
export type BacklinkOpportunity = { id: string; name: string; domain: string; url: string; type: string; relevanceScore?: number | null; status: string; evidence: string; evidenceUrl: string; suggestedTargetUrl: string; suggestedAnchorTexts: string[]; suggestedApproach: string; risk: string; lastCheckedAt?: string | null };
export type SeoOverview = { audit?: { createdAt: string; report?: { issues?: Record<string, number> } }; opportunities: number; suggestions: number; live: number };

export type KeywordInput = Omit<SeoKeyword, 'id' | 'product' | 'post'>;
export type CampaignInput = { name: string; slug: string; description?: string; goal?: string; status: ContentStatus; startsAt?: string; endsAt?: string; posts?: Array<{ postId: string; sortOrder: number }> };

export const seoAdminApi = {
  overview: () => apiClient.get<SeoOverview>('/admin/seo'),
  products: () => apiClient.get<SeoContent[]>('/admin/seo/products'),
  posts: () => apiClient.get<SeoContent[]>('/admin/seo/posts'),
  keywords: (params?: { page?: number; limit?: number; status?: KeywordStatus }) => apiClient.get<{ items: SeoKeyword[]; total: number }>('/admin/seo/keywords', { params }),
  createKeyword: (data: Omit<KeywordInput, 'productId' | 'postId'> & { productId?: string; postId?: string }) => apiClient.post<SeoKeyword>('/admin/seo/keywords', data),
  updateKeyword: (id: string, data: Partial<KeywordInput>) => apiClient.patch<SeoKeyword>(`/admin/seo/keywords/${id}`, data),
  deleteKeyword: (id: string) => apiClient.delete(`/admin/seo/keywords/${id}`),
  audit: (sourceType: 'PRODUCT' | 'POST', sourceId: string) => apiClient.post<{ score: number; issues: unknown[] }>('/admin/seo/audits', { sourceType, sourceId }),
  internalLinks: () => apiClient.get<InternalLink[]>('/admin/seo/internal-links'),
  updateInternalLink: (id: string, data: { anchorText?: string; reason?: string; status?: 'PENDING' | 'APPROVED' | 'REJECTED' }) => apiClient.patch<InternalLink>(`/admin/seo/internal-links/${id}`, data),
  opportunities: () => apiClient.get<BacklinkOpportunity[]>('/admin/seo/backlinks/opportunities'),
  campaigns: (params?: { page?: number; limit?: number }) => apiClient.get<{ items: Campaign[]; total: number }>('/admin/seo/campaigns', { params }),
  createCampaign: (data: CampaignInput) => apiClient.post<Campaign>('/admin/seo/campaigns', data),
  updateCampaign: (id: string, data: Partial<CampaignInput>) => apiClient.patch<Campaign>(`/admin/seo/campaigns/${id}`, data),
};
