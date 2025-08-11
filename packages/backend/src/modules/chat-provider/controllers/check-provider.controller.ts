import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ChatProviderService } from '../services/chat-provider.service';
import { CheckAvailableModelsDto } from '../dtos/check-available-models.dto';

@Controller('check-provider')
export class CheckProviderController {
  @Inject()
  private readonly checkProviderService: ChatProviderService;

  @Post()
  checkProvider(@Body() dto: CheckAvailableModelsDto) {
    return this.checkProviderService.checkAvailableModelsForPotentialProvider(
      dto,
    );
  }
}
