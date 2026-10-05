import { PublicStoreInfo } from "@/lib/api-client";
import { siteUrl } from "@/lib/site-config";
export function LocalBusinessJsonLd({store}:{store:PublicStoreInfo}){
 const sameAs=[store.facebookUrl].filter(Boolean);
 const data={"@context":"https://schema.org","@type":"LocalBusiness","@id":siteUrl+"#localbusiness",name:store.name,url:store.website||siteUrl,telephone:store.phone,email:store.email||undefined,address:{"@type":"PostalAddress",streetAddress:store.address,addressCountry:"VN"},openingHours:store.businessHours||undefined,image:store.logoUrl||undefined,sameAs:sameAs.length?sameAs:undefined,geo:typeof store.latitude==="number"&&typeof store.longitude==="number"?{"@type":"GeoCoordinates",latitude:store.latitude,longitude:store.longitude}:undefined};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\\u003c")}}/>;
}
