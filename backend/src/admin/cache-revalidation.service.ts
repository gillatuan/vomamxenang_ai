import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type CachePurgeScope = 'ALL' | 'PRODUCT' | 'POST' | 'PATH';

@Injectable()
export class CacheRevalidationService {
  constructor(private readonly config: ConfigService) {}

  async purge(input: { scope: CachePurgeScope; id?: string; path?: string }) {
    const url = this.config.get<string>('FRONTEND_REVALIDATE_URL');
    const secret = this.config.get<string>('FRONTEND_REVALIDATION_SECRET');
    if (!url || !secret) throw new ServiceUnavailableException('Cache revalidation is not configured.');
    if ((input.scope === 'PRODUCT' || input.scope === 'POST') && !input.id) throw new BadRequestException('An item ID is required.');
    if (input.scope === 'PATH' && (!input.path || !input.path.startsWith('/'))) throw new BadRequestException('A valid path is required.');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidation-secret': secret },
        body: JSON.stringify(input),
      });
      const data = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new BadGatewayException(data?.message || 'The frontend did not accept the cache purge request.');
      return data;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException('Unable to reach the frontend cache revalidation endpoint.');
    }
  }
}
