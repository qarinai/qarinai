import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LlmProviderService } from '../services/llm-provider.service';
import { CheckAvailableModelsDto } from '../dtos/check-available-models.dto';

@Controller('check-provider')
export class CheckProviderController {
  @Inject()
  private readonly checkProviderService: LlmProviderService;

  @Post()
  checkProvider(@Body() dto: CheckAvailableModelsDto) {
    return this.checkProviderService.checkAvailableModelsForPotentialProvider(
      dto,
    );
  }
}
