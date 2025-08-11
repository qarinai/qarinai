import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Repository } from 'typeorm';
import { AgentService } from 'src/modules/agent/services/agent.service';

@Injectable()
export class ConversationService {
  @InjectRepository(Conversation)
  public repo: Repository<Conversation>;

  @Inject()
  private readonly agentService: AgentService;

  async getConversationByIdAndAgentId(
    id: string,
    agentId: string,
  ): Promise<Conversation> {
    const conversation = await this.repo.findOne({
      where: { id, agent: { id: agentId } },
      relations: [
        'messages',
        'agent',
        'agent.defaultModel',
        'agent.allowedModels',
      ],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with id ${id} not found`);
    }

    return conversation;
  }

  async initializeConversation(agentId: string, model?: string) {
    const agent = await this.agentService.getAgentByIdForConversation(
      agentId,
      model,
    );

    const systemMessage =
      await this.agentService.getComposedSystemMessage(agent);

    const conversation = this.repo.create({
      agent,
      systemMessage,
      messages: [],
      totalTokens: 0,
    });

    return this.repo.save(conversation);
  }

  async updateConversationTotalTokens(id: string, totalTokens: number) {
    return this.repo.save({ id, totalTokens });
  }
}
