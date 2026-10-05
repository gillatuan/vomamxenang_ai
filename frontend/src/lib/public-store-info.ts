import type { PublicStoreInfo } from "@/lib/api-client";
const apiUrl=(process.env.NEXT_PUBLIC_API_BASE||process.env.NEXT_PUBLIC_BACKEND_URL||"https://vomamxenang-backend.vercel.app/api/v1").replace(/\/$/,"");
export async function getPublicStoreInfo():Promise<PublicStoreInfo|null>{try{const r=await fetch(`${apiUrl}/store-info/public`,{cache:"no-store"});if(!r.ok)return null;return r.json();}catch{return null;}}
