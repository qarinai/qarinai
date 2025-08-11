import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatProvider } from '../entities/chat-provider.entity';
import { Repository } from 'typeorm';
import { CreateChatProviderDto } from '../dtos/create-chat-provider.dto';
import { OpenAIChatProviderClientService } from '../clients/open-ai-chat-provider-client.service';
import { ChatProviderModelService } from './chat-provider-model.service';
import { CheckAvailableModelsDto } from '../dtos/check-available-models.dto';
import { ChatProviderModel } from '../entities/chat-provider-model.entity';
import { SecureKeyService } from 'src/modules/secure-keys/services/secure-key.service';

@Injectable()
export class ChatProviderService {
  @Inject()
  private readonly providerClientService: OpenAIChatProviderClientService;

  @Inject()
  private readonly chatProviderModelService: ChatProviderModelService;

  @Inject()
  private readonly secureKeyService: SecureKeyService;

  @InjectRepository(ChatProvider)
  public repo: Repository<ChatProvider>;

  listChatProviders() {
    return this.repo.find({
      relations: ['models'],
    });
  }

  async getChatProviderClientByModel(modelOrId: string | ChatProviderModel) {
    let model: ChatProviderModel | null;

    if (typeof modelOrId === 'string') {
      model = await this.chatProviderModelService.getModelById(modelOrId);
    } else {
      model = modelOrId;
    }

    if (!model) {
      throw new Error(`Chat provider model not found`);
    }

    const provider = await this.repo.findOne({
      where: { models: { id: model.id } },
      relations: ['models', 'apiKey'],
    });

    if (!provider) {
      throw new Error(`Chat provider for model ${model.name} not found`);
    }

    return await this.providerClientService.with(provider);
  }

  async checkAvailableModelsForPotentialProvider(dto: CheckAvailableModelsDto) {
    const client = this.providerClientService.getTransientClient(
      dto.apiBaseUrl,
      dto.apiKey,
    );

    const r = await client.models.list();

    return r.data;
  }

  async createChatProvider(providerData: CreateChatProviderDto) {
    const { models, apiKey, ...rest } = providerData;

    const secureKey =
      await this.secureKeyService.createAndSaveSecureKey(apiKey);
    let provider = this.repo.create({
      ...rest,
      apiKey: secureKey,
    });

    provider = await this.repo.save(provider);

    const savedModels =
      await this.chatProviderModelService.createModelsForProvider(
        provider.id,
        models,
      );

    provider.models = savedModels;

    return provider;
  }

  async getAvailableProviderModels(providerId: string) {
    const provider = await this.repo.findOne({
      where: { id: providerId },
    });
    if (!provider) {
      throw new Error(`Chat provider with ID ${providerId} not found`);
    }
    const client = await this.providerClientService.with(provider);

    return client.models.list();
  }

  async saveProviderModels(providerId: string, modelNames: string[]) {
    const provider = await this.repo.findOne({
      where: { id: providerId },
    });
    if (!provider) {
      throw new Error(`Chat provider with ID ${providerId} not found`);
    }

    const models = await this.chatProviderModelService.createModelsForProvider(
      providerId,
      modelNames,
    );

    provider.models = models;

    return provider;
  }
}
