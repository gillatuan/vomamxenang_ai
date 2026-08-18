import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { SEO_PROMPT } from '../prompts/seo.prompt';
import { seoSchema, validateGenerated } from '../schemas/ai.schemas';
import { AiProvider, GeneratedSeo } from '../types/ai.types';
@Injectable()
export class SeoAiService { constructor(@Inject('AI_PROVIDER') private provider:AiProvider){} async generate(input:unknown){for(let i=0;i<2;i++){const result=await this.provider.generateStructuredOutput<GeneratedSeo>(SEO_PROMPT,input,seoSchema);if(validateGenerated(result,['title','metaDescription','slug','primaryKeyword','suggestions']))return result;}throw new BadGatewayException('The AI returned invalid SEO metadata.');} }
