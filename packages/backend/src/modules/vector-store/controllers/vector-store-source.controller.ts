import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateVectorStoreSourceDto } from '../dtos/create-vector-store-source.dto';
import { VectorStoreSourceService } from '../services/vector-store-source.service';

@Controller('vector-store-sources')
export class VectorStoreSourceController {
  @Inject()
  private readonly vectorStoreSourceService: VectorStoreSourceService;

  @Post()
  async createVectorStoreSource(@Body() dto: CreateVectorStoreSourceDto) {
    return this.vectorStoreSourceService.createVectorStoreSource(dto);
  }
}
