import { Module } from '@nestjs/common';
import { DashboardService } from './services/dashboard.service';
import { AgentModule } from '../agent/agent.module';
import { LlmProviderModule } from '../llm-provider/llm-provider.module';
import { McpModule } from '../mcp/mcp.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { DashboardController } from './controllers/dashboard.controller';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [
    AgentModule,
    LlmProviderModule,
    McpModule,
    VectorStoreModule,
    ConversationModule,
  ],
})
export class DashboardModule {}
