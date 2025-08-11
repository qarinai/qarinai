import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { VectorStoreService } from '../services/vector-store.service';
import { CreateVectorStoreDto } from '../dtos/create-vector-store.dto';
import { SearchVectorStoreDto } from '../dtos/search-vector-store.dto';

@Controller('vector-stores')
export class VectorStoreController {
  @Inject()
  private readonly vectorStoreService: VectorStoreService;

  @Get()
  listVectorStores() {
    return this.vectorStoreService.listVectorStores();
  }

  @Get(':id')
  getVectorStoreById(@Param('id') id: string) {
    return this.vectorStoreService.getVectorStoreById(id);
  }

  @Post()
  async createVectorStore(@Body() dto: CreateVectorStoreDto) {
    return this.vectorStoreService.createVectorStore(dto);
  }

  @Post(':id/search')
  async searchVectorStore(
    @Param('id') id: string,
    @Body() dto: SearchVectorStoreDto,
  ) {
    return this.vectorStoreService.searchVectorStore(dto, id);
  }

  @Post(':id/generate-mcp-server')
  async generateMcpServer(@Param('id') id: string) {
    return this.vectorStoreService.generateMcpServer(id);
  }
}
