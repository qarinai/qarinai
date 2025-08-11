import { Controller, Get, Inject } from '@nestjs/common';
import { SecureKeyService } from '../services/secure-key.service';

@Controller('secure-keys')
export class SecureKeyController {
  @Inject()
  private readonly secureKeyService: SecureKeyService;

  @Get(':id')
  async getKeyById(id: string) {
    return this.secureKeyService.getKeyById(id);
  }
}
