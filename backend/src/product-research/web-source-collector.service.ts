import { BadRequestException, Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

export type WebSource={url:string;title:string;text:string};
@Injectable()
export class WebSourceCollectorService {
  private isPublicHttpUrl(raw:string){
    try{const u=new URL(raw);return u.protocol==='https:'&&!['localhost','127.0.0.1','0.0.0.0','::1'].includes(u.hostname)&&!u.hostname.endsWith('.local');}catch{return false;}
  }
  async collect(query:string):Promise<WebSource[]>{
    const searchUrl=`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    let html:string;
    try{html=await this.fetchText(searchUrl);}catch(error){
      if(error instanceof BadRequestException)throw error;
      throw new BadRequestException('Web Source Collector không truy cập được search provider. Research chưa được tạo.');
    }
    const $=cheerio.load(html);const urls:string[]=[];
    $('.result__a').each((_,el)=>{const href=$(el).attr('href');if(!href)return;try{const u=new URL(href,'https://duckduckgo.com');const target=u.searchParams.get('uddg')||u.href;if(this.isPublicHttpUrl(target)&&!target.includes('duckduckgo.com'))urls.push(target);}catch{}});
    const unique=[...new Set(urls)].slice(0,8);
    const settled=await Promise.allSettled(unique.map(url=>this.fetchPage(url)));
    return settled.filter((x):x is PromiseFulfilledResult<WebSource>=>x.status==='fulfilled').map(x=>x.value).filter(x=>x.text.length>=120).slice(0,5);
  }
  private async fetchPage(url:string):Promise<WebSource>{
    const html=await this.fetchText(url);const $=cheerio.load(html);$('script,style,noscript,svg,nav,footer,form').remove();
    const title=($('title').first().text()||url).trim();
    const text=$('main,article,body').first().text().replace(/\s+/g,' ').trim().slice(0,12000);
    return {url,title,text};
  }
  private async fetchText(url:string){
    let r:Response;
    try{r=await fetch(url,{signal:AbortSignal.timeout(10000),redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 (compatible; VoMamXeNangResearch/1.0; +https://www.vomamxenang.com/)','Accept':'text/html,application/xhtml+xml'}});}
    catch(error){const reason=(error as Error)?.name==='TimeoutError'||(error as Error)?.name==='AbortError'?'timeout':'network error';throw new BadRequestException(`Không truy cập được nguồn web (${reason}).`);}
    if(!r.ok)throw new BadRequestException(`Không đọc được nguồn web (HTTP ${r.status}).`);
    const type=r.headers.get('content-type')||'';if(!type.includes('text/html'))throw new BadRequestException('Nguồn không phải HTML.');
    return (await r.text()).slice(0,1000000);
  }
}
