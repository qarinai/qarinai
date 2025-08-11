/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { McpPropeService } from '../services/mcp-prope.service';

@Controller('mcp-prope')
export class McpPropeController {
  @Inject()
  private readonly service: McpPropeService;

  @Post('list-tools')
  async listMcpTools(
    @Body('url') url: string,
    @Body('token') token?: string,
    @Body('tokenType') tokenType?: 'bearer' | 'basic',
  ) {
    const tools = await this.service.listMcpTools(url, token, tokenType);
    return tools;
  }
}
