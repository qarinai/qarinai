import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import {
  SendMessageBodyDto,
  SendMessageParamsDto,
} from '../dtos/send-message.dto';
import { Conversation } from '../entities/conversation.entity';
import { LlmProviderService } from 'src/modules/llm-provider/services/llm-provider.service';
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionToolChoiceOption,
} from 'openai/resources/index';
import { AgentService } from 'src/modules/agent/services/agent.service';
import { LlmProviderModel } from 'src/modules/llm-provider/entities/llm-provider-model.entity';
import { Response } from 'express';
import { IResponseChunk } from '../interfaces/response-chunk.interface';

@Injectable()
export class MessageService {
  @InjectRepository(Message)
  public repo: Repository<Message>;

  @Inject()
  private readonly conversationService: ConversationService;

  @Inject()
  private readonly llmProviderService: LlmProviderService;

  @Inject()
  private readonly agentService: AgentService;

  async assistantMessageResponse(
    body: SendMessageBodyDto,
    params: SendMessageParamsDto,
    res: Response,
  ) {
    // initialize or get conversation
    const conversation = await this.getConversation(body, params);
    // prepare conversation model
    const model = this.getConversationModel(conversation, body.model);

    // save user message
    const userMessage = await this.repo.save({
      content: body.content,
      conversation: {
        id: conversation.id,
      },
      model: {
        id: model.id,
      },
      role: 'user',
      status: 'completed',
    });
    conversation.messages.push(userMessage);

    // send messages to chat provider and stream response

    const llmProviderClient =
      await this.llmProviderService.getLlmProviderClientByModel(model);

    const availableTools =
      await this.agentService.getMcpServersModelToolsByAgentId(
        conversation.agent.id,
      );
    const completionTools = this.getChatCompletionsTools(availableTools);

    let shouldReiterate = false;
    let toolCalls: Record<number, ChatCompletionChunk.Choice.Delta.ToolCall> =
      {};

    do {
      console.log('starting chat completion', shouldReiterate);

      const assistantMessage = await this.repo.save(
        this.repo.create({
          content: '',
          conversation: {
            id: conversation.id,
          },
          model: {
            id: model.id,
          },
          role: 'assistant',
          status: 'generating',
        }),
      );

      try {
        const strippedMessages =
          this.mapConversationMessagesToChatCompletionMessages(conversation);
        const result = await llmProviderClient.chat.completions.create({
          model: model.name,
          messages: strippedMessages,
          tools: completionTools,
          temperature: conversation.agent.tempreture ?? 0.2,
          max_completion_tokens: conversation.agent.maxCompletionTokens ?? -1,
          parallel_tool_calls: false,
          tool_choice: this.getToolChoiceOption(
            strippedMessages,
            shouldReiterate,
          ),
          stream: true,
          stream_options: {
            include_usage: true,
          },
        });

        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/event-stream');
        }
        this.sendResponseChunk(res, {
          m: {
            messageId: userMessage.id,
            conversationId: conversation.id,
          },
        });

        for await (const chunk of result) {
          await this.handleIncomingChunk(
            chunk,
            toolCalls,
            assistantMessage,
            conversation,
            res,
          );
        }
        assistantMessage.status = 'completed';
        await this.repo.save(assistantMessage);

        if (Object.entries(toolCalls).length > 0) {
          conversation.messages.push(assistantMessage);
          await this.getToolCallResult(
            toolCalls[0],
            conversation,
            model,
            body.additionalToolParameters,
          );

          shouldReiterate = true;

          toolCalls = {};
        } else {
          res.end();
          console.log('end');
          return;
        }
      } catch (err) {
        console.error(err);
        if (res.headersSent) {
          res.write(`error: ${err.message}\n`);
          res.end();
          return;
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
          });
          return;
        }
      }
    } while (shouldReiterate);
  }

  private async handleIncomingChunk(
    chunk: ChatCompletionChunk,
    toolCalls: Record<number, ChatCompletionChunk.Choice.Delta.ToolCall>,
    assistantMessage: Message,
    conversation: Conversation,
    res: Response,
  ) {
    const responseDelta = chunk.choices?.[0]?.delta;

    if (responseDelta?.tool_calls) {
      // handle tool calls
      this.appendToolCallsFromChunkDelta(toolCalls, responseDelta.tool_calls);

      assistantMessage.additionalData = {
        tool_calls: Object.values(toolCalls),
      };
      this.sendResponseChunk(res, {
        tool_call: 'active',
      });
    } else if (responseDelta?.content) {
      // handle content
      assistantMessage.content += responseDelta.content;
      this.sendResponseChunk(res, { c: responseDelta.content });
    } else if (chunk.usage) {
      // handle usage
      assistantMessage.numTokens = chunk.usage.completion_tokens ?? 0;
      conversation.totalTokens += chunk.usage.total_tokens ?? 0;
      this.sendResponseChunk(res, {
        tokens: {
          completion: chunk.usage.completion_tokens ?? 0,
          all: chunk.usage.total_tokens ?? 0,
        },
      });
    }
    await this.repo.save(assistantMessage);
  }

  private getConversationModel(conversation: Conversation, model?: string) {
    if (model) {
      const allModels = [
        ...conversation.agent.allowedModels,
        conversation.agent.defaultModel,
      ];

      const foundModel = allModels.find((m) => m.name === model);
      if (!foundModel) {
        throw new BadRequestException(
          `Model ${model} not found for this agent`,
        );
      }

      return foundModel;
    } else {
      return conversation.agent.defaultModel;
    }
  }

  private mapConversationMessagesToChatCompletionMessages(
    conversation: Conversation,
  ) {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: conversation.systemMessage,
      },
      ...conversation.messages.map((msg) => ({
        role: msg.role,
        content:
          msg.role === 'tool'
            ? this.extractToolResponseFromContent(msg.content)
            : msg.content,
        tool_calls: msg.additionalData?.tool_calls?.map((t) => ({
          id: t.id ?? '',
          type: 'function',
          function: {
            name: t.function?.name ?? '',
            arguments: t.function?.arguments ?? '',
          },
        })),
        tool_call_id: msg.additionalData?.tool_call_id ?? undefined,
      })),
    ];

    return messages;
  }

  private extractToolResponseFromContent(content: string) {
    try {
      const c = JSON.parse(content);
      return c.content?.[0]?.text ?? content;
    } catch {
      return content;
    }
  }

  private getChatCompletionsTools(
    availableTools: { name: string; description: string; inputSchema: any }[],
  ) {
    return availableTools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));
  }

  private getToolChoiceOption(
    messages: ChatCompletionMessageParam[],
    shouldReiterate: boolean,
  ): ChatCompletionToolChoiceOption {
    if (shouldReiterate) {
      return 'none';
    }

    return messages.at(-1)?.role === 'tool' ? 'none' : 'auto';
  }

  private appendToolCallsFromChunkDelta(
    toolCalls: Record<number, ChatCompletionChunk.Choice.Delta.ToolCall>,
    deltaToolCalls: ChatCompletionChunk.Choice.Delta.ToolCall[],
  ) {
    if (toolCalls[deltaToolCalls[0].index]) {
      // append
      toolCalls[deltaToolCalls[0].index].function = {
        ...toolCalls[deltaToolCalls[0].index].function,
        arguments:
          (toolCalls[deltaToolCalls[0].index].function?.arguments ?? '') +
          (deltaToolCalls[0].function?.arguments ?? ''),
      };
    } else {
      const index = deltaToolCalls[0].index;
      toolCalls[index] = {
        index,
        id: deltaToolCalls[0].id,
        function: deltaToolCalls[0].function,
      };
    }
  }

  private sendResponseChunk(res: Response, chunk: IResponseChunk) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  private async getConversation(
    body: SendMessageBodyDto,
    params: SendMessageParamsDto,
  ) {
    let conversation: Conversation;
    if (body.conversationId) {
      conversation =
        await this.conversationService.getConversationByIdAndAgentId(
          body.conversationId,
          params.agentId,
        );
    } else {
      conversation = await this.conversationService.initializeConversation(
        params.agentId,
        body.model,
      );
    }

    return conversation;
  }

  private async getToolCallResult(
    toolCall: ChatCompletionChunk.Choice.Delta.ToolCall,
    conversation: Conversation,
    model: LlmProviderModel,
    additionalToolParameters?: Record<string, string>,
  ) {
    const result = await this.agentService.callToolFromAgent(
      conversation.agent,
      {
        ...toolCall.function,
        arguments: {
          ...JSON.parse(toolCall.function?.arguments || '{}'),
          ...additionalToolParameters,
        },
      },
    );

    const toolMessage = await this.repo.save(
      this.repo.create({
        content: typeof result === 'string' ? result : JSON.stringify(result),
        conversation: {
          id: conversation.id,
        },
        model: {
          id: model.id,
        },
        role: 'tool',
        additionalData: {
          tool_call_id: toolCall.id,
          tool_input: toolCall.function?.arguments,
          tool_name: toolCall.function?.name,
        },
      }),
    );

    conversation.messages.push(toolMessage);

    return toolMessage;
  }
}
