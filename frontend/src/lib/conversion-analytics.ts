import apiClient from "./api";
export type ConversionEventType="VIEW_SIZE"|"VIEW_PRODUCT"|"CLICK_PHONE"|"CLICK_ZALO"|"OPEN_QUOTE"|"SUBMIT_QUOTE";
function session(){if(typeof window==="undefined")return undefined;let id=sessionStorage.getItem("vmx-session");if(!id){id=crypto.randomUUID();sessionStorage.setItem("vmx-session",id)}return id}
export function trackConversion(type:ConversionEventType,data:{productId?:string;context?:string;path?:string}={}){if(typeof window==="undefined")return;const body={type,path:data.path||window.location.pathname,productId:data.productId,context:data.context,sessionId:session()};apiClient.post("/conversion-analytics/event",body).catch(()=>{})}
export const conversionAnalyticsAPI={report:()=>apiClient.get<{events:Record<string,number>;leads:Record<string,number>;topPaths:{path:string;count:number}[]}>("/conversion-analytics/report")};
