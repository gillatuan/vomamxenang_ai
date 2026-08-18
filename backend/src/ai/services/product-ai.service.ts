import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { GenerateProductDto } from '../dto/generate-product.dto';
import { PRODUCT_PROMPT } from '../prompts/product.prompt';
import { productSchema, validateGenerated } from '../schemas/ai.schemas';
import { AiProvider, GeneratedProduct } from '../types/ai.types';
@Injectable()
export class ProductAiService {
  constructor(@Inject('AI_PROVIDER') private provider: AiProvider) {}
  async generate(input: GenerateProductDto) {
    for (let attempt = 0; attempt < 2; attempt++) { const result = await this.provider.generateStructuredOutput<GeneratedProduct>(PRODUCT_PROMPT, input, productSchema); if (validateGenerated(result, ['name','slug','description','seo','missingInformation'])) return result; }
    throw new BadGatewayException('The AI returned an invalid product draft.');
  }
}
