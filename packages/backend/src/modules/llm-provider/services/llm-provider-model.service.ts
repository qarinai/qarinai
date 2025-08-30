import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LlmProviderModel } from '../entities/llm-provider-model.entity';
import { Repository } from 'typeorm';
import { LlmProvider } from '../entities/llm-provider.entity';

@Injectable()
export class LlmProviderModelService {
  @InjectRepository(LlmProviderModel)
  private readonly llmProviderModelRepository: Repository<LlmProviderModel>;

  async getModelById(id: string): Promise<LlmProviderModel | null> {
    const model = await this.llmProviderModelRepository.findOne({
      where: { id },
    });

    if (!model) {
      throw new NotFoundException(`LLM provider model with ID ${id} not found`);
    }

    return model;
  }

  createModelsForProvider(providerId: string, modelNames: string[]) {
    const modelEntities = modelNames.map((modelName) => {
      const model = this.llmProviderModelRepository.create({
        name: modelName,
        provider: { id: providerId } as LlmProvider,
      });
      return model;
    });

    return this.llmProviderModelRepository.save(modelEntities);
  }
}
