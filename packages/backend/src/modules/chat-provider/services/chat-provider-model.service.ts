import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatProviderModel } from '../entities/chat-provider-model.entity';
import { Repository } from 'typeorm';
import { ChatProvider } from '../entities/chat-provider.entity';

@Injectable()
export class ChatProviderModelService {
  @InjectRepository(ChatProviderModel)
  private readonly chatProviderModelRepository: Repository<ChatProviderModel>;

  async getModelById(id: string): Promise<ChatProviderModel | null> {
    const model = await this.chatProviderModelRepository.findOne({
      where: { id },
    });

    if (!model) {
      throw new NotFoundException(
        `Chat provider model with ID ${id} not found`,
      );
    }

    return model;
  }

  createModelsForProvider(providerId: string, modelNames: string[]) {
    const modelEntities = modelNames.map((modelName) => {
      const model = this.chatProviderModelRepository.create({
        name: modelName,
        provider: { id: providerId } as ChatProvider,
      });
      return model;
    });

    return this.chatProviderModelRepository.save(modelEntities);
  }
}
