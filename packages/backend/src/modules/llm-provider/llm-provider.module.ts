import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LlmProvider } from './entities/llm-provider.entity';
import { LlmProviderModel } from './entities/llm-provider-model.entity';
import { LlmProviderController } from './controllers/llm-provider.controller';
import { LlmProviderModelService } from './services/llm-provider-model.service';
import { LlmProviderService } from './services/llm-provider.service';
import { OpenAILlmProviderClientService } from './clients/open-ai-llm-provider-client.service';
import { CheckProviderController } from './controllers/check-provider.controller';

@Module({
  controllers: [LlmProviderController, CheckProviderController],
  imports: [TypeOrmModule.forFeature([LlmProvider, LlmProviderModel])],
  providers: [
    LlmProviderModelService,
    LlmProviderService,
    OpenAILlmProviderClientService,
  ],
  exports: [LlmProviderService, LlmProviderModelService],
})
export class LlmProviderModule {}
