import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { GenerateBlogDto } from '../dto/generate-blog.dto';
import { BLOG_PROMPT } from '../prompts/blog.prompt';
import { blogSchema, validateGenerated } from '../schemas/ai.schemas';
import { AiProvider, GeneratedBlog } from '../types/ai.types';
@Injectable()
export class BlogAiService {
  constructor(@Inject('AI_PROVIDER') private provider: AiProvider) {}
  async generate(input: GenerateBlogDto) { for(let i=0;i<2;i++){const result=await this.provider.generateStructuredOutput<GeneratedBlog>(BLOG_PROMPT,input,blogSchema);if(validateGenerated(result,['title','slug','content','seo','missingInformation']))return result;} throw new BadGatewayException('The AI returned an invalid blog draft.'); }
}
