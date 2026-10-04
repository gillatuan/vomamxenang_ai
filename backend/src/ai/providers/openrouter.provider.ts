import { BadGatewayException, HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, JsonSchema } from '../types/ai.types';

@Injectable()
export class OpenRouterProvider implements AiProvider {
  readonly name='openrouter';
  readonly model:string;
  private readonly apiKey?:string;
  private readonly models:string[];

  constructor(config:ConfigService){
    this.apiKey=config.get<string>('OPENROUTER_API_KEY');
    // Free-first: explicit free endpoints only. Never silently fall back to a paid model.
    const configured=(config.get<string>('OPENROUTER_FREE_MODELS')||'')
      .split(',').map(x=>x.trim()).filter(Boolean);
    this.models=configured.length?configured:[
      'google/gemma-4-26b-a4b-it:free',
      'google/gemma-4-31b-it:free',
    ];
    this.model=this.models[0];
  }

  async generateStructuredOutput<T>(system:string,input:unknown,schema:JsonSchema):Promise<T>{
    if(!this.apiKey)throw new ServiceUnavailableException('OpenRouter chưa được cấu hình (OPENROUTER_API_KEY).');

    const failures:string[]=[];
    for(const model of this.models){
      if(!model.endsWith(':free')){
        failures.push(`${model}: rejected because it is not an explicit :free endpoint`);
        continue;
      }
      try{
        const value=await this.requestModel<T>(model,system,input,schema);
        if(value!==null)return value;
        failures.push(`${model}: invalid JSON`);
      }catch(error){
        if(error instanceof HttpException){
          failures.push(`${model}: HTTP ${error.getStatus()}`);
          continue;
        }
        failures.push(`${model}: request failed`);
      }
    }

    throw new BadGatewayException(
      `Không có OpenRouter free model nào hoàn thành structured extraction. ${failures.join('; ')}`
    );
  }

  private async requestModel<T>(model:string,system:string,input:unknown,schema:JsonSchema):Promise<T|null>{
    let response:Response;
    try{
      response=await fetch('https://openrouter.ai/api/v1/chat/completions',{
        method:'POST',
        signal:AbortSignal.timeout(60000),
        headers:{
          Authorization:`Bearer ${this.apiKey}`,
          'Content-Type':'application/json',
          'HTTP-Referer':'https://www.vomamxenang.com',
          'X-Title':'Vo Mam Xe Nang',
        },
        body:JSON.stringify({
          model,
          messages:[
            {role:'system',content:`${system}\nReturn ONLY one valid JSON object. No markdown, commentary, or prose outside JSON.`},
            {role:'user',content:JSON.stringify(input)},
          ],
          response_format:{type:'json_schema',json_schema:{name:'research',strict:true,schema}},
        }),
      });
    }catch(error){
      const name=(error as Error)?.name;
      if(name==='TimeoutError'||name==='AbortError')
        throw new HttpException(`${model} timeout sau 60 giây.`,HttpStatus.GATEWAY_TIMEOUT);
      throw new BadGatewayException(`Không kết nối được ${model}.`);
    }

    if(!response.ok){
      // 402 must never trigger a paid fallback; move to the next explicit free endpoint.
      if(response.status===401||response.status===403)
        throw new ServiceUnavailableException('OPENROUTER_API_KEY không hợp lệ hoặc không có quyền.');
      if(response.status===429)
        throw new HttpException(`${model} đang rate limit.`,HttpStatus.TOO_MANY_REQUESTS);
      if(response.status===402)
        throw new HttpException(`${model} hiện không được OpenRouter phục vụ miễn phí cho request này.`,HttpStatus.PAYMENT_REQUIRED);
      throw new BadGatewayException(`${model} không khả dụng (HTTP ${response.status}).`);
    }

    const body=await response.json() as {choices?:Array<{message?:{content?:string|null}}>} ;
    const raw=body.choices?.[0]?.message?.content?.trim();
    if(!raw)return null;
    return this.parseJson<T>(raw);
  }

  private parseJson<T>(raw:string):T|null{
    const candidates=[raw];
    const fenced=raw.match(/```(?:json)?\\s*([\\s\\S]*?)```/i)?.[1]?.trim();
    if(fenced)candidates.push(fenced);
    const start=raw.indexOf('{'),end=raw.lastIndexOf('}');
    if(start>=0&&end>start)candidates.push(raw.slice(start,end+1));
    for(const candidate of candidates){
      try{return JSON.parse(candidate) as T;}catch{}
    }
    return null;
  }
}
