import apiClient from "./api";
export type ConversionEventType="VIEW_SIZE"|"VIEW_PRODUCT"|"CLICK_PHONE"|"CLICK_ZALO"|"OPEN_QUOTE"|"SUBMIT_QUOTE";
export type ConversionReport={
 events:Record<string,number>;leads:Record<string,number>;topPaths:{path:string;count:number}[];
 sales:{totalLeads:number;recentLeads:number;overdue:number;unassigned:number;won:number;lost:number;winRate:number};
 byAssignee:{assigneeId:string|null;email:string;total:number;won:number;open:number}[];
 topSources:{source:string;count:number}[];
 topLandingPages:{path:string;count:number}[];
 topProducts:{product:{id:string;name:string;sku:string;slug:string|null};count:number}[];
};
function session(){if(typeof window==="undefined")return undefined;let id=sessionStorage.getItem("vmx-session");if(!id){id=crypto.randomUUID();sessionStorage.setItem("vmx-session",id)}return id}
export function trackConversion(type:ConversionEventType,data:{productId?:string;context?:string;path?:string}={}){if(typeof window==="undefined")return;const body={type,path:data.path||window.location.pathname,productId:data.productId,context:data.context,sessionId:session()};apiClient.post("/conversion-analytics/event",body).catch(()=>{})}
export const conversionAnalyticsAPI={report:()=>apiClient.get<ConversionReport>("/conversion-analytics/report")};
