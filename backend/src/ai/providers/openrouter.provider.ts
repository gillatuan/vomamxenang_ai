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
    const response=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',signal:AbortSignal.timeout(45000),
      headers:{Authorization:`Bearer ${this.apiKey}`,'Content-Type':'application/json','HTTP-Referer':'https://www.vomamxenang.com','X-Title':'Vo Mam Xe Nang'},
      body:JSON.stringify({model:this.model,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(input)}],
        response_format:{type:'json_schema',json_schema:{name:'research',strict:true,schema}}})});
    if(!response.ok){
      if(response.status===429)throw new HttpException('OpenRouter Free đang rate limit hoặc đã đạt giới hạn request. Thử lại sau.',HttpStatus.TOO_MANY_REQUESTS);
      if(response.status===401||response.status===403)throw new ServiceUnavailableException('OPENROUTER_API_KEY không hợp lệ hoặc không có quyền.');
      throw new BadGatewayException(`OpenRouter tạm thời không khả dụng (HTTP ${response.status}).`);
    }
    const body=await response.json() as {choices?:Array<{message?:{content?:string}}>} ;
    const text=body.choices?.[0]?.message?.content;
    if(!text)throw new BadGatewayException('OpenRouter trả về response rỗng.');
    try{return JSON.parse(text) as T;}catch{throw new BadGatewayException('OpenRouter không trả về JSON hợp lệ.');}
  }
}
