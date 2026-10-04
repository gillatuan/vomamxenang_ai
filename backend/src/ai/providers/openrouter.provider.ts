import { BadGatewayException, HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, JsonSchema } from '../types/ai.types';

@Injectable()
export class OpenRouterProvider implements AiProvider {
  readonly name='openrouter';
  readonly model:string;
  private readonly apiKey?:string;
  constructor(config:ConfigService){
    this.apiKey=config.get<string>('OPENROUTER_API_KEY');
    this.model=config.get<string>('OPENROUTER_MODEL')||'openrouter/free';
  }
  async generateStructuredOutput<T>(system:string,input:unknown,schema:JsonSchema):Promise<T>{
    if(!this.apiKey)throw new ServiceUnavailableException('OpenRouter chưa được cấu hình (OPENROUTER_API_KEY).');
    let response:Response;
    try{
      response=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',signal:AbortSignal.timeout(90000),
        headers:{Authorization:`Bearer ${this.apiKey}`,'Content-Type':'application/json','HTTP-Referer':'https://www.vomamxenang.com','X-Title':'Vo Mam Xe Nang'},
        body:JSON.stringify({model:this.model,messages:[{role:'system',content:`${system}\nReturn ONLY one valid JSON object. No markdown fences, no commentary. The JSON must conform to this schema: ${JSON.stringify(schema)}`},{role:'user',content:JSON.stringify(input)}],
          response_format:{type:'json_schema',json_schema:{name:'research',strict:true,schema}}})});
    }catch(error){
      const name=(error as Error)?.name;
      if(name==='TimeoutError'||name==='AbortError')throw new HttpException('OpenRouter Free model phản hồi quá chậm và đã timeout sau 90 giây. Vui lòng thử lại.',HttpStatus.GATEWAY_TIMEOUT);
      throw new BadGatewayException('Không kết nối được OpenRouter.');
    }
    if(!response.ok){
      if(response.status===429)throw new HttpException('OpenRouter Free đang rate limit hoặc đã đạt giới hạn request. Thử lại sau.',HttpStatus.TOO_MANY_REQUESTS);
      if(response.status===401||response.status===403)throw new ServiceUnavailableException('OPENROUTER_API_KEY không hợp lệ hoặc không có quyền.');
      throw new BadGatewayException(`OpenRouter tạm thời không khả dụng (HTTP ${response.status}).`);
    }
    const body=await response.json() as {choices?:Array<{message?:{content?:string|null;refusal?:string}}>};
    const raw=body.choices?.[0]?.message?.content?.trim();
    if(!raw)throw new BadGatewayException('OpenRouter Free model trả về response rỗng hoặc từ chối structured output.');

    // Free routing can select models that ignore response_format and wrap JSON
    // in markdown fences or explanatory text. Parse conservatively without
    // trusting any non-JSON prose.
    const candidates=[raw];
    const fenced=raw.match(/```(?:json)?\\s*([\\s\\S]*?)```/i)?.[1]?.trim();
    if(fenced)candidates.push(fenced);
    const firstObject=raw.indexOf('{'),lastObject=raw.lastIndexOf('}');
    if(firstObject>=0&&lastObject>firstObject)candidates.push(raw.slice(firstObject,lastObject+1));
    for(const candidate of candidates){
      try{return JSON.parse(candidate) as T;}catch{}
    }

    // Some free models emit JSON-like output despite explicit structured-output
    // instructions. Make one deterministic repair attempt using the same free
    // endpoint; research validation still rejects unsupported facts afterwards.
    const repair=await this.repairJson<T>(raw,schema);
    if(repair)return repair;
    throw new BadGatewayException('OpenRouter Free model không trả về JSON parse được sau bước repair. Vui lòng thử lại.');
  }
  private async repairJson<T>(raw:string,schema:JsonSchema):Promise<T|null>{
    try{
      const response=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',signal:AbortSignal.timeout(60000),
        headers:{Authorization:`Bearer ${this.apiKey}`,'Content-Type':'application/json','HTTP-Referer':'https://www.vomamxenang.com','X-Title':'Vo Mam Xe Nang'},
        body:JSON.stringify({model:this.model,messages:[{role:'system',content:`Convert the supplied text to ONE valid JSON object matching this schema exactly. Do not add facts, URLs, evidence, or claims. If a value cannot be recovered, use an empty string/array as appropriate. Return JSON only. Schema: ${JSON.stringify(schema)}`},{role:'user',content:raw}]})});
      if(!response.ok)return null;
      const body=await response.json() as {choices?:Array<{message?:{content?:string|null}}>} ;
      const text=body.choices?.[0]?.message?.content?.trim();if(!text)return null;
      const cleaned=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
      const start=cleaned.indexOf('{'),end=cleaned.lastIndexOf('}');
      return JSON.parse(start>=0&&end>start?cleaned.slice(start,end+1):cleaned) as T;
    }catch{return null;}
  }
}
