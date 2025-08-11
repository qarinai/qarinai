import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatProvider } from './entities/chat-provider.entity';
import { ChatProviderModel } from './entities/chat-provider-model.entity';
import { ChatProviderController } from './controllers/chat-provider.controller';
import { ChatProviderModelService } from './services/chat-provider-model.service';
import { ChatProviderService } from './services/chat-provider.service';
import { OpenAIChatProviderClientService } from './clients/open-ai-chat-provider-client.service';
import { CheckProviderController } from './controllers/check-provider.controller';

@Module({
  controllers: [ChatProviderController, CheckProviderController],
  imports: [TypeOrmModule.forFeature([ChatProvider, ChatProviderModel])],
  providers: [
    ChatProviderModelService,
    ChatProviderService,
    OpenAIChatProviderClientService,
  ],
  exports: [ChatProviderService, ChatProviderModelService],
})
export class ChatProviderModule {}
