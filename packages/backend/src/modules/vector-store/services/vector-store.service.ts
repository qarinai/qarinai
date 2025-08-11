import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingService } from 'src/modules/settings/services/setting.service';
import { VectorStore } from '../entities/vector-store.entity';
import { Repository } from 'typeorm';
import { CreateVectorStoreDto } from '../dtos/create-vector-store.dto';
import { VectorStoreStatus } from '../enums/vector-store-status.enum';
import { SearchVectorStoreDto } from '../dtos/search-vector-store.dto';
import { EmbeddingsService } from './embeddings.service';
import { VSAlogirthmOperatorsMapper } from '../mappers/vector-search-algorithm-operators.mapper';
import { VectorSearchAlgorithm } from '../enums/vector-search-algorithm.enum';
import { McpAdapterServerService } from 'src/modules/mcp/services/mcp-adapter-server.service';
import { McpAdapterServerType } from 'src/modules/mcp/enums/mcp-adapter-server-types.enum';
import { McpToolTypes } from 'src/modules/mcp/enums/mcp-tool-types.enum';
import * as _ from 'lodash';
import { VectorStoreSourceChunkService } from './vector-store-source-chunk.service';

@Injectable()
export class VectorStoreService {
  @Inject()
  private readonly settings: SettingService;

  @Inject()
  private readonly embeddingsService: EmbeddingsService;

  @Inject()
  private readonly chunksService: VectorStoreSourceChunkService;

  @Inject(forwardRef(() => McpAdapterServerService))
  private readonly mcpAdapterServerService: McpAdapterServerService;

  @InjectRepository(VectorStore)
  public repo: Repository<VectorStore>;

  listVectorStores() {
    return this.repo.find({
      relations: ['sources'],
      order: { createdAt: 'DESC' },
    });
  }

  createVectorStore(dto: CreateVectorStoreDto) {
    const vectorStore = this.repo.create(dto);
    return this.repo.save(vectorStore);
  }

  async searchVectorStore(dto: SearchVectorStoreDto, storeId: string) {
    const { query, topK, algorithm } = dto;

    const queryEmbeddings =
      await this.embeddingsService.generateEmbeddings(query);

    const op =
      VSAlogirthmOperatorsMapper[
        algorithm || VectorSearchAlgorithm.CosineDistance
      ];

    return this.chunksService.searchChunks(storeId, queryEmbeddings, topK, op);
  }

  async getVectorStoreById(id: string) {
    const vectorStore = await this.repo.findOne({
      where: { id },
      relations: ['sources', 'mcpServer'],
    });

    if (!vectorStore) {
      throw new NotFoundException('Vector store not found');
    }

    return vectorStore;
  }

  async updateStoreStatus(id: string, status: VectorStoreStatus) {
    const vectorStore = await this.getVectorStoreById(id);
    vectorStore.status = status;
    return this.repo.save(vectorStore);
  }

  async updateStore(id: string, valuesToUpdate: Partial<VectorStore>) {
    const vectorStore = await this.getVectorStoreById(id);
    Object.assign(vectorStore, valuesToUpdate);
    return this.repo.save(vectorStore);
  }

  async generateMcpServer(id: string) {
    const vectorStore = await this.getVectorStoreById(id);
    if (vectorStore.mcpServer) {
      throw new ConflictException(
        'MCP Server already exists for this vector store',
      );
    }

    const server = await this.mcpAdapterServerService.createMcpServer({
      name: `MCP Server for Vector Store: ${vectorStore.name}`,
      description: vectorStore.generatedDescription,
      type: McpAdapterServerType.VectorStore,
      security: {
        isSecure: false,
        securityType: 'none',
      },
      tools: [
        {
          name: 'search_' + _.snakeCase(vectorStore.name),
          description: 'Search for information inside ' + vectorStore.name,
          type: McpToolTypes.VectorSearch,
          data: {
            storeId: vectorStore.id,
          },
        },
      ],
    });

    vectorStore.mcpServer = server;
    await this.repo.save(vectorStore);

    return vectorStore;
  }
}
