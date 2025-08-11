import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { AgentModule } from '../agent/agent.module';
import { ChatProviderModule } from '../chat-provider/chat-provider.module';
import { AgentChatController } from './controllers/agent-chat.controller';

@Module({
  controllers: [AgentChatController],
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    AgentModule,
    ChatProviderModule,
  ],
  providers: [ConversationService, MessageService],
  exports: [ConversationService, MessageService],
})
export class ConversationModule {}
