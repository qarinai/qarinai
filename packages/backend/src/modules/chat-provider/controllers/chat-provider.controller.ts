import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ChatProviderService } from '../services/chat-provider.service';
import { CreateChatProviderDto } from '../dtos/create-chat-provider.dto';

@Controller('chat-providers')
export class ChatProviderController {
  @Inject()
  private readonly chatProviderService: ChatProviderService;

  @Get()
  listChatProviders() {
    return this.chatProviderService.listChatProviders();
  }

  @Post()
  createProvider(@Body() dto: CreateChatProviderDto) {
    return this.chatProviderService.createChatProvider(dto);
  }
}
