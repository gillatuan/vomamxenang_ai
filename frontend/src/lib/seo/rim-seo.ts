export interface PublicRim { id: string; sku: string; size: string; boltHoles: number; brand?: string | null; compatibleModels?: string | null; sellingPrice?: number | null; createdAt?: string; }
export const rimPath = (rim: { id: string }) => `/mam-xe-nang/${encodeURIComponent(rim.id)}`;
export const rimTitle = (rim: PublicRim) => `Mâm xe nâng ${rim.size} ${rim.boltHoles} lỗ${rim.brand ? ` · ${rim.brand}` : ''}`;
export const rimDescription = (rim: PublicRim) => `${rimTitle(rim)}. ${rim.compatibleModels ? `Thông tin dòng xe ghi nhận: ${rim.compatibleModels}. ` : ''}Đối chiếu kích thước và cấu hình lắp thực tế trước khi đặt hàng.`;
