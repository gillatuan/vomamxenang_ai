import { BadGatewayException, GatewayTimeoutException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, JsonSchema } from '../types/ai.types';

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';
  readonly model: string;
  private readonly apiKey?: string;
  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY');
    this.model = config.get<string>('OPENAI_MODEL') || 'gpt-4.1-mini';
  }

  async generateStructuredOutput<T>(system: string, input: unknown, schema: JsonSchema): Promise<T> {
    if (!this.apiKey) throw new ServiceUnavailableException('AI service is not configured.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const source = input as Record<string, unknown>;
      const images = Array.isArray(source?.images) ? source.images.filter((item): item is string => typeof item === 'string') : [];
      const textInput = JSON.stringify({ ...source, images: images.map((_, imageIndex) => ({ imageIndex })) });
      const content: Array<Record<string, string>> = [{ type: 'input_text', text: textInput }, ...images.map((image_url) => ({ type: 'input_image', image_url }))];
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, instructions: system, input: [{ role: 'user', content }], text: { format: { type: 'json_schema', name: 'ai_content', strict: true, schema } } }),
      });
      if (response.status === 429) throw new BadGatewayException('AI service is busy. Please try again.');
      if (!response.ok) throw new BadGatewayException('We could not generate content right now.');
      const body = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
      const text = body.output_text || body.output?.flatMap((item) => item.content || []).map((item) => item.text || '').join('');
      if (!text) throw new BadGatewayException('The AI returned an invalid response.');
      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof BadGatewayException || error instanceof ServiceUnavailableException) throw error;
      if ((error as Error).name === 'AbortError') throw new GatewayTimeoutException('AI generation timed out. Please try again.');
      throw new BadGatewayException('We could not generate content right now.');
    } finally { clearTimeout(timeout); }
  }
}
