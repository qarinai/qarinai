import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { LlmProviderService } from '../services/llm-provider.service';
import { CreateLlmProviderDto } from '../dtos/create-llm-provider.dto';

@Controller('llm-providers')
export class LlmProviderController {
  @Inject()
  private readonly llmProviderService: LlmProviderService;

  @Get()
  listLlmProviders() {
    return this.llmProviderService.listLlmProviders();
  }

  @Post()
  createProvider(@Body() dto: CreateLlmProviderDto) {
    return this.llmProviderService.createLlmProvider(dto);
  }
}
