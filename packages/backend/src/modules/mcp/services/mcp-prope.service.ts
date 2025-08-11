import { Injectable } from '@nestjs/common';

import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

@Injectable()
export class McpPropeService {
  async listMcpTools(
    url: string,
    token?: string,
    tokenType?: 'bearer' | 'basic',
  ): Promise<any> {
    const transport = new StreamableHTTPClientTransport(new URL(url), {
      requestInit:
        token && tokenType
          ? {
              headers: {
                Authorization: `${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)} ${token}`,
              },
            }
          : {},
    });

    const client = new Client({
      name: 'Qarin MCP Client',
      version: '1.0.0',
    });

    await client.connect(transport);

    const tools = await client.listTools();

    return tools.tools;
  }
}
