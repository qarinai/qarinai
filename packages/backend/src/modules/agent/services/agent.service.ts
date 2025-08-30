import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent } from '../entities/agent.entity';
import { Repository } from 'typeorm';
import { CreateAgentDto } from '../dtos/create-agent.dto';
import { LlmProviderModel } from 'src/modules/llm-provider/entities/llm-provider-model.entity';
import { McpAdapterServer } from 'src/modules/mcp/entities/mcp-adapter-server.entity';
import { McpAdapterServerService } from 'src/modules/mcp/services/mcp-adapter-server.service';
import { ChatCompletionChunk } from 'openai/resources/index';
import { McpAdapterToolService } from 'src/modules/mcp/services/mcp-adapter-tool.service';

@Injectable()
export class AgentService {
  @InjectRepository(Agent)
  public repo: Repository<Agent>;

  @Inject()
  private readonly mcpAdapterServerService: McpAdapterServerService;

  @Inject()
  private readonly mcpAdapterToolService: McpAdapterToolService;

  async getAgentById(id: string) {
    const agent = await this.repo.findOne({
      where: { id },
      relations: ['defaultModel', 'allowedModels', 'linkedMCPServers'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with id ${id} not found`);
    }

    if (!agent.isActive) {
      throw new BadRequestException('Agent is not active');
    }

    return agent;
  }

  async getComposedSystemMessage(agentOrId: string | Agent) {
    let agent: Agent | null;

    if (typeof agentOrId === 'string') {
      agent = await this.repo.findOne({
        where: { id: agentOrId },
      });
    } else {
      agent = agentOrId;
    }

    if (!agent) {
      throw new NotFoundException(`Agent not found`);
    }

    if (!agent.isActive) {
      throw new BadRequestException('Agent is not active');
    }

    const systemMessageParts = [
      `Your name is ${agent.name}.`,
      agent.identityMessage,
      agent.systemMessage,
    ];

    return systemMessageParts.join('\n\n');
  }

  async getAgentByIdForConversation(id: string, model?: string) {
    const agent = await this.repo.findOne({
      where: { id },
      relations: ['defaultModel', 'allowedModels'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with id ${id} not found`);
    }

    if (!agent.isActive) {
      throw new BadRequestException('Agent is not active');
    }

    if (
      model &&
      agent.defaultModel.name !== model &&
      !agent.allowedModels.some((m) => m.name === model)
    ) {
      throw new BadRequestException(
        `Model ${model} is not allowed for this agent`,
      );
    }

    return agent;
  }

  async listAgents() {
    return this.repo.find({
      relations: ['defaultModel', 'allowedModels', 'linkedMCPServers'],
    });
  }

  async createAgent(dto: CreateAgentDto) {
    const { allowedModelIds, defaultModelId, linkedMcpServerIds, ...rest } =
      dto;
    let agent = this.repo.create(rest);
    agent = await this.repo.save(agent);

    if (defaultModelId) {
      agent.defaultModel = {
        id: defaultModelId,
      } as LlmProviderModel;
    }

    if (allowedModelIds && allowedModelIds.length > 0) {
      agent.allowedModels = allowedModelIds.map((modelId) => {
        return {
          id: modelId,
        } as LlmProviderModel;
      });
    }

    if (linkedMcpServerIds && linkedMcpServerIds.length > 0) {
      agent.linkedMCPServers = linkedMcpServerIds.map((serverId) => {
        return {
          id: serverId,
        } as McpAdapterServer;
      });
    }

    return this.repo.save(agent);
  }

  async updateAgent(id: string, dto: CreateAgentDto) {
    const { allowedModelIds, defaultModelId, linkedMcpServerIds, ...rest } =
      dto;
    let agent = await this.repo.findOne({
      where: { id },
      relations: ['defaultModel', 'allowedModels', 'linkedMCPServers'],
    });
    if (!agent) {
      throw new NotFoundException(`Agent with id ${id} not found`);
    }

    agent = this.repo.merge(agent, rest);

    if (defaultModelId) {
      agent.defaultModel = {
        id: defaultModelId,
      } as LlmProviderModel;
    }

    if (allowedModelIds && allowedModelIds.length > 0) {
      agent.allowedModels = allowedModelIds.map((modelId) => {
        return {
          id: modelId,
        } as LlmProviderModel;
      });
    }

    if (linkedMcpServerIds && linkedMcpServerIds.length > 0) {
      agent.linkedMCPServers = linkedMcpServerIds.map((serverId) => {
        return {
          id: serverId,
        } as McpAdapterServer;
      });
    }

    return this.repo.save(agent);
  }

  async getMcpServersModelToolsByAgentId(agentOrId: string | Agent) {
    let agent: Agent | null;

    if (typeof agentOrId === 'string') {
      agent = await this.repo.findOne({
        where: { id: agentOrId },
        relations: ['linkedMCPServers'],
      });
    } else {
      agent = agentOrId;
      if (agent.linkedMCPServers === undefined) {
        agent = await this.repo.findOne({
          where: { id: agent.id },
          relations: ['linkedMCPServers'],
        });
      }
    }

    if (!agent) {
      throw new NotFoundException(`Agent not found`);
    }

    if (!agent.linkedMCPServers || agent.linkedMCPServers.length === 0) {
      return [];
    }

    const serverIds = agent.linkedMCPServers.map((server) => server.id);

    return this.mcpAdapterServerService.getModelToolsByServerIds(serverIds);
  }

  async getMcpServersToolsByAgentId(agentOrId: string | Agent) {
    let agent: Agent | null;

    if (typeof agentOrId === 'string') {
      agent = await this.repo.findOne({
        where: { id: agentOrId },
        relations: ['linkedMCPServers'],
      });
    } else {
      agent = agentOrId;
      if (agent.linkedMCPServers === undefined) {
        agent = await this.repo.findOne({
          where: { id: agent.id },
          relations: ['linkedMCPServers'],
        });
      }
    }

    if (!agent) {
      throw new NotFoundException(`Agent not found`);
    }

    if (!agent.linkedMCPServers || agent.linkedMCPServers.length === 0) {
      return [];
    }

    const serverIds = agent.linkedMCPServers.map((server) => server.id);

    return this.mcpAdapterServerService.getToolsByServerIds(serverIds);
  }

  async callToolFromAgent(
    agent: Agent,
    toolCallFunction?: ChatCompletionChunk.Choice.Delta.ToolCall.Function,
  ) {
    console.log('Calling tool from agent:', agent.name, toolCallFunction);

    const tools = await this.getMcpServersToolsByAgentId(agent);
    const foundTool = tools.find(
      (tool) => tool.tool.name === toolCallFunction?.name,
    );

    if (!foundTool) {
      return {
        success: false,
        error: {
          message: `Tool ${toolCallFunction?.name} not found`,
        },
      };
    }

    try {
      const result = await this.mcpAdapterToolService.callTool(
        foundTool.tool,
        toolCallFunction?.arguments,
        foundTool.security,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      return {
        isError: false,
        content: [
          {
            type: 'text',
            text: `Error calling tool ${toolCallFunction?.name}: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
}
