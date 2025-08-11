import { Module } from '@nestjs/common';
import { DashboardService } from './services/dashboard.service';
import { AgentModule } from '../agent/agent.module';
import { ChatProviderModule } from '../chat-provider/chat-provider.module';
import { McpModule } from '../mcp/mcp.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { DashboardController } from './controllers/dashboard.controller';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [
    AgentModule,
    ChatProviderModule,
    McpModule,
    VectorStoreModule,
    ConversationModule,
  ],
})
export class DashboardModule {}
