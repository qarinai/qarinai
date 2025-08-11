import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateMcpServerDto } from '../dtos/create-mcp-server.dto';
import { McpAdapterServerService } from '../services/mcp-adapter-server.service';

@Controller('mcp-servers')
export class McpServerController {
  @Inject()
  private readonly mcpServerService: McpAdapterServerService;

  @Get()
  listMcpServers() {
    return this.mcpServerService.listMcpServers();
  }

  @Post(':serverId/mcp')
  @Post(':serverId/sse')
  handleMcpServerCall(
    @Param('serverId') serverId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.mcpServerService.handleServerCall(serverId, req, res);
  }

  @Post()
  createMcpServer(@Body() createMcpServerDto: CreateMcpServerDto) {
    return this.mcpServerService.createMcpServer(createMcpServerDto);
  }
}
