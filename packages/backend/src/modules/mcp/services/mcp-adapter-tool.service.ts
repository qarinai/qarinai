import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpServer as McpServerSdk } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { McpToolTypes } from '../enums/mcp-tool-types.enum';
import { RestApiCallToolService } from './tools/rest-api-call.tool.service';
import { IMcpServerSecurity } from '../interfaces/server-security.interface';
import { McpAdapterTool } from '../entities/mcp-adapter-tool.entity';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SecureKeyService } from 'src/modules/secure-keys/services/secure-key.service';
import { McpProxyCallToolService } from './tools/mcp-proxy-call.tool.service';
import { McpSearchVectorStoreToolService } from './tools/mcp-search-vector-store.tool.service';

@Injectable()
export class McpAdapterToolService {
  @InjectRepository(McpAdapterTool)
  private readonly mcpToolRepository: Repository<McpAdapterTool>;

  @Inject()
  private readonly restApiCallToolService: RestApiCallToolService;

  @Inject()
  private readonly mcpProxyCallToolService: McpProxyCallToolService;

  @Inject()
  private readonly mcpSearchVectorStoreToolService: McpSearchVectorStoreToolService;

  @Inject()
  private readonly secureKeyService: SecureKeyService;

  async buildToolsForSdkServer(
    sdkServer: McpServerSdk,
    toolEntities: McpAdapterTool[],
    security: IMcpServerSecurity,
  ) {
    for (const toolEntity of toolEntities) {
      const toolSchema = await this.buildToolInputSchema(toolEntity, security);
      sdkServer.registerTool(
        toolEntity.name,
        {
          description: toolEntity.description,
          inputSchema: toolSchema,
        },
        async (params: any) => {
          const response = await this.callTool(toolEntity, params, security);
          console.log(`Tool ${toolEntity.name} executed with params:`, params);
          console.log(`Tool ${toolEntity.name} response:`, response);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        },
      );
    }
  }

  buildToolInputSchema(
    toolEntity: McpAdapterTool,
    security?: IMcpServerSecurity,
  ) {
    switch (toolEntity.type) {
      case McpToolTypes.RestApiCall:
        return this.restApiCallToolService.buildToolInputSchema(
          toolEntity,
          security,
        );
      case McpToolTypes.McpCallTool:
        return this.mcpProxyCallToolService.buildToolInputSchema(
          toolEntity,
          security,
        );
      case McpToolTypes.VectorSearch:
        return this.mcpSearchVectorStoreToolService.buildToolInputSchema(
          toolEntity,
          security,
        );
    }
  }

  async buildToolInputJsonSchema(
    toolEntity: McpAdapterTool,
    security?: IMcpServerSecurity,
  ): Promise<Record<string, any>> {
    const toolSchema = await this.buildToolInputSchema(toolEntity, security);
    return zodToJsonSchema(z.object(toolSchema));
  }

  async createTool(
    name: string,
    description: string,
    data: any,
    serverId?: string,
    type: McpToolTypes = McpToolTypes.RestApiCall,
  ): Promise<McpAdapterTool> {
    const newTool = this.mcpToolRepository.create({
      name,
      description,
      type,
      toolData: data,
      serverId: serverId || undefined,
    });

    return this.mcpToolRepository.save(newTool);
  }

  async callTool(tool: McpAdapterTool, p: any, security?: IMcpServerSecurity) {
    const params = typeof p === 'string' ? JSON.parse(p) : p;
    switch (tool.type) {
      case McpToolTypes.RestApiCall:
        return this.restApiCallToolService.executeTool(
          tool,
          { ...params } as Record<string, any>,
          security,
        );
      case McpToolTypes.McpCallTool:
        return this.mcpProxyCallToolService.executeTool(
          tool,
          { ...params } as Record<string, any>,
          security,
        );
      case McpToolTypes.VectorSearch:
        return this.mcpSearchVectorStoreToolService.executeTool(
          tool,
          { ...params } as Record<string, any>,
          security,
        );
    }
  }
}
