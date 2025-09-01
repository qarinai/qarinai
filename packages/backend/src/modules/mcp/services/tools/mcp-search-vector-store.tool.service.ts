/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { IMcpServerSecurity } from '../../interfaces/server-security.interface';
import { IToolService } from '../../interfaces/tool-service.interface';
import { McpAdapterTool } from '../../entities/mcp-adapter-tool.entity';
import { ToolVectorSearchDataDefinition } from '../../interfaces/mcp.interfaces';
import { VectorStoreService } from 'src/modules/vector-store/services/vector-store.service';
import { VectorSearchAlgorithm } from 'src/modules/vector-store/enums/vector-search-algorithm.enum';
import { z } from 'zod';

@Injectable()
export class McpSearchVectorStoreToolService implements IToolService {
  @Inject()
  private readonly vectorStoreService: VectorStoreService;

  async executeTool(
    toolEntity: McpAdapterTool,
    callParams: Record<string, any>,
    security?: IMcpServerSecurity,
  ) {
    // implementation here

    const toolData = toolEntity.toolData as ToolVectorSearchDataDefinition;
    if (!callParams.query) {
      throw new Error('Query parameter is required for vector search');
    }

    const result = await this.vectorStoreService.searchVectorStore(
      {
        query: callParams.query,
        topK: callParams.topK || 5,
        algorithm: callParams.algorithm || VectorSearchAlgorithm.CosineDistance,
      },
      toolData.storeId,
    );

    return result
      .map(
        (item) =>
          `Score: ${item.score}\nContent: ${item.content}\nSource: ${JSON.stringify(item.source.metadata)}`,
      )
      .join('\n\n---\n\n');
  }

  async buildToolInputSchema(
    entity: McpAdapterTool,
    security?: IMcpServerSecurity,
  ): Promise<Record<string, any>> {
    const toolData = entity.toolData as ToolVectorSearchDataDefinition;

    const store = await this.vectorStoreService.getVectorStoreById(
      toolData.storeId,
    );

    return {
      query: z
        .string()
        .describe(
          `The search query to find relevant documents in the ${store.name}`,
        ),
      topK: z
        .number()
        .default(5)
        .describe('The number of top results to return')
        .optional(),
      algorithm: z
        .enum(Object.values(VectorSearchAlgorithm) as [string, ...string[]])
        .default(VectorSearchAlgorithm.CosineDistance)
        .describe('The algorithm to use for vector search')
        .optional(),
    };
  }
}
