import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LlmProvider } from '../entities/llm-provider.entity';
import { Repository } from 'typeorm';
import { CreateLlmProviderDto } from '../dtos/create-llm-provider.dto';
import { OpenAILlmProviderClientService } from '../clients/open-ai-llm-provider-client.service';
import { LlmProviderModelService } from './llm-provider-model.service';
import { CheckAvailableModelsDto } from '../dtos/check-available-models.dto';
import { LlmProviderModel } from '../entities/llm-provider-model.entity';
import { SecureKeyService } from 'src/modules/secure-keys/services/secure-key.service';

@Injectable()
export class LlmProviderService {
  @Inject()
  private readonly providerClientService: OpenAILlmProviderClientService;

  @Inject()
  private readonly llmProviderModelService: LlmProviderModelService;

  @Inject()
  private readonly secureKeyService: SecureKeyService;

  @InjectRepository(LlmProvider)
  public repo: Repository<LlmProvider>;

  listLlmProviders() {
    return this.repo.find({
      relations: ['models'],
    });
  }

  async getLlmProviderClientByModel(modelOrId: string | LlmProviderModel) {
    let model: LlmProviderModel | null;

    if (typeof modelOrId === 'string') {
      model = await this.llmProviderModelService.getModelById(modelOrId);
    } else {
      model = modelOrId;
    }

    if (!model) {
      throw new Error(`LLM provider model not found`);
    }

    const provider = await this.repo.findOne({
      where: { models: { id: model.id } },
      relations: ['models', 'apiKey'],
    });

    if (!provider) {
      throw new Error(`LLM provider for model ${model.name} not found`);
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

  async createLlmProvider(providerData: CreateLlmProviderDto) {
    const { models, apiKey, ...rest } = providerData;

    const secureKey =
      await this.secureKeyService.createAndSaveSecureKey(apiKey);
    let provider = this.repo.create({
      ...rest,
      apiKey: secureKey,
    });

    provider = await this.repo.save(provider);

    const savedModels =
      await this.llmProviderModelService.createModelsForProvider(
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
      throw new Error(`LLM provider with ID ${providerId} not found`);
    }
    const client = await this.providerClientService.with(provider);

    return client.models.list();
  }

  async saveProviderModels(providerId: string, modelNames: string[]) {
    const provider = await this.repo.findOne({
      where: { id: providerId },
    });
    if (!provider) {
      throw new Error(`LLM provider with ID ${providerId} not found`);
    }

    const models = await this.llmProviderModelService.createModelsForProvider(
      providerId,
      modelNames,
    );

    provider.models = models;

    return provider;
  }
}
