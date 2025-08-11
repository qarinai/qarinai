import { Inject, Injectable } from '@nestjs/common';
import { ChatProvider } from '../entities/chat-provider.entity';
import OpenAI from 'openai';
import { SecureKeyService } from 'src/modules/secure-keys/services/secure-key.service';

@Injectable()
export class OpenAIChatProviderClientService {
  @Inject()
  private readonly secureKeyService: SecureKeyService;

  private readonly clientMap = new Map<string, OpenAI>();

  getTransientClient(url: string, apiKey: string): OpenAI {
    const client = new OpenAI({
      apiKey,
      baseURL: url,
    });

    return client;
  }

  async with(provider: ChatProvider) {
    if (this.clientMap.has(provider.id)) {
      return this.clientMap.get(provider.id) as OpenAI;
    }

    const apiKey = await this.secureKeyService.getDecryptedKeyById(
      provider.apiKey.id,
    );

    const client = new OpenAI({
      apiKey,
      baseURL: provider.apiBaseUrl,
    });

    this.clientMap.set(provider.id, client);

    return client;
  }
}
