import { Inject, Injectable } from '@nestjs/common';
import { AgentService } from 'src/modules/agent/services/agent.service';
import { ChatProviderService } from 'src/modules/chat-provider/services/chat-provider.service';
import { ConversationService } from 'src/modules/conversation/services/conversation.service';
import { MessageService } from 'src/modules/conversation/services/message.service';
import { McpAdapterServerService } from 'src/modules/mcp/services/mcp-adapter-server.service';
import { VectorStoreService } from 'src/modules/vector-store/services/vector-store.service';
import * as dayjs from 'dayjs';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(LocalizedFormat);

@Injectable()
export class DashboardService {
  @Inject()
  private readonly agentService: AgentService;

  @Inject()
  private readonly chatProviderService: ChatProviderService;

  @Inject()
  private readonly mcpAdapterServerService: McpAdapterServerService;

  @Inject()
  private readonly vectorStoreService: VectorStoreService;

  @Inject()
  private readonly conversationService: ConversationService;

  @Inject()
  private readonly messageService: MessageService;

  async getStats() {
    const agents = await this.agentService.repo.count();
    const chatProviders = await this.chatProviderService.repo.count();
    const mcpServers = await this.mcpAdapterServerService.repo.count();
    const vectorStores = await this.vectorStoreService.repo.count();

    return {
      agents,
      chatProviders,
      mcpServers,
      vectorStores,
    };
  }

  async messageChartData() {
    const messageCount: Array<{
      day: Date;
      messages: string;
    }> = await this.messageService.repo.manager.query(`
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT
        ds.day,
        COUNT(m.id) AS messages
      FROM date_series ds
      LEFT JOIN message m ON DATE(m."created_at") = ds.day
      GROUP BY ds.day
      ORDER BY ds.day ASC`);
    const conversationsCount: Array<{
      day: Date;
      conversations: string;
      tokens: string;
    }> = await this.messageService.repo.manager.query(`
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT
        ds.day,
        COUNT(c.id) AS conversations,
        COALESCE(SUM(c.total_tokens), 0) AS tokens
      FROM date_series ds
      LEFT JOIN conversation c ON DATE(c."created_at") = ds.day
      GROUP BY ds.day
      ORDER BY ds.day ASC`);

    return messageCount.map((item) => ({
      day: dayjs(item.day).format('ll'),
      messages: Number(item.messages),
      conversations: Number(
        conversationsCount.find((conv) =>
          dayjs(conv.day).isSame(dayjs(item.day), 'day'),
        )?.conversations || 0,
      ),
      tokens: Number(
        conversationsCount.find((conv) =>
          dayjs(conv.day).isSame(dayjs(item.day), 'day'),
        )?.tokens || 0,
      ),
    }));
  }
}
