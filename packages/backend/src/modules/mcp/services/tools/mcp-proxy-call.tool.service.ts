/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { ToolMcpProxyDataDefinition } from '../../interfaces/mcp.interfaces';
import { IMcpServerSecurity } from '../../interfaces/server-security.interface';
import { IToolService } from '../../interfaces/tool-service.interface';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { McpAdapterTool } from '../../entities/mcp-adapter-tool.entity';
import { SecureKeyService } from 'src/modules/secure-keys/services/secure-key.service';
import { convertJsonSchemaToZod } from '../../utils';
import { JSONSchema } from 'zod/v4/core/json-schema';

@Injectable()
export class McpProxyCallToolService implements IToolService {
  @Inject()
  private readonly secureKeyService: SecureKeyService;

  async executeTool(
    toolEntity: McpAdapterTool,
    callParams: Record<string, any>,
    security?: IMcpServerSecurity,
  ): Promise<any> {
    const toolData = toolEntity.toolData as ToolMcpProxyDataDefinition;
    const headers = {};

    if (security?.isSecure) {
      if (security.securityType === 'bearer') {
        if (security.value.type === 'static') {
          const secureKeyId = security.value.token;
          const secureKey =
            await this.secureKeyService.getDecryptedKeyById(secureKeyId);
          headers['Authorization'] = `Bearer ${secureKey}`;
        }

        // TODO: Implement dynamic token retrieval
      } else if (security.securityType === 'basic') {
        if (security.value.type === 'static') {
          const usernameSecureKeyId = security.value.credentials.username;
          const passwordSecureKeyId = security.value.credentials.password;
          const username =
            await this.secureKeyService.getDecryptedKeyById(
              usernameSecureKeyId,
            );
          const password =
            await this.secureKeyService.getDecryptedKeyById(
              passwordSecureKeyId,
            );
          headers['Authorization'] = `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`;
        }
        // TODO: Implement dynamic credentials retrieval
      }
    }
    const transport = new StreamableHTTPClientTransport(
      new URL(toolData.url ?? ''),
      {
        requestInit: {
          headers,
        },
      },
    );
    const client = new Client({
      name: 'Qarin MCP Client',
      version: '1.0.0',
    });

    await client.connect(transport);

    const response = await client.callTool({
      name: toolEntity.name,
      arguments: callParams,
    });

    await client.close();
    await transport.close();

    return response;
  }

  buildToolInputSchema(
    entity: McpAdapterTool,
    security?: IMcpServerSecurity,
  ): Record<string, any> {
    const toolData = entity.toolData as ToolMcpProxyDataDefinition;

    // TODO: Handle security parameters in the schema

    const schema: Record<string, any> = {};

    for (const [key, value] of Object.entries(
      toolData.inputSchema.properties || {},
    )) {
      schema[key] = convertJsonSchemaToZod({
        ...(value as JSONSchema),
        isRequired: toolData.inputSchema.required?.includes(key) ?? false,
      });
    }

    return schema;
  }
}
