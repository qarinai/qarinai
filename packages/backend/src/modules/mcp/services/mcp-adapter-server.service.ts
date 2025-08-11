import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { McpErrorCodes } from '../enums/mcp-error-codes.enum';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CreateMcpServerDto } from '../dtos/create-mcp-server.dto';
import { McpAdapterServer } from '../entities/mcp-adapter-server.entity';
import { McpAdapterToolService } from './mcp-adapter-tool.service';
import { McpAdapterServerType } from '../enums/mcp-adapter-server-types.enum';
import { SecureKeyService } from 'src/modules/secure-keys/services/secure-key.service';

@Injectable()
export class McpAdapterServerService {
  @InjectRepository(McpAdapterServer)
  public repo: Repository<McpAdapterServer>;

  @Inject()
  private readonly adapterToolService: McpAdapterToolService;

  @Inject()
  private readonly secureKeyService: SecureKeyService;

  //
  async findServerById(id: string): Promise<McpAdapterServer | null> {
    return this.repo.findOne({
      where: {
        id,
      },
      relations: ['tools'],
    });
  }

  async listMcpServers() {
    return this.repo.find({
      where: {},
      relations: ['tools'],
      order: {
        createdAt: 'DESC',
      },
      select: {
        tools: {
          id: true,
          name: true,
        },
      },
    });
  }

  disableServer(id: string) {
    return this.repo.update(id, { isActive: false });
  }
  enableServer(id: string) {
    return this.repo.update(id, { isActive: true });
  }
  deleteServer(id: string) {
    return this.repo.softDelete(id);
  }

  async handleServerCall(id: string, req: Request, res: Response) {
    const serverData = await this.findServerById(id);
    if (!serverData || serverData.isActive === false) {
      return res.status(404).json({
        message: 'Server not found or is inactive',
        code: McpErrorCodes.InvalidRequest,
      });
    }

    const mcpServerInstance = new McpServer({
      name: serverData.name,
      description: serverData.description,
      version: '1.0.0',
    });

    await this.adapterToolService.buildToolsForSdkServer(
      mcpServerInstance,
      serverData.tools,
      serverData.security,
    );

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on('close', () => {
      console.log('Response closed');
      void transport.close();
      void mcpServerInstance.close();
    });

    try {
      await mcpServerInstance.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling server call:', error);
      return res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: McpErrorCodes.InternalError,
          message: 'Internal server error',
        },
        id: (req?.body?.id || null) as number | null,
      });
    }
  }

  async createMcpServer(body: CreateMcpServerDto) {
    // check if security has any keys to encrypt
    if (body.security?.isSecure && body.security.value.type === 'static') {
      switch (body.security.securityType) {
        case 'basic': {
          const { username, password } = body.security.value.credentials;
          const secureUsername =
            await this.secureKeyService.createAndSaveSecureKey(username);
          const securePassword =
            await this.secureKeyService.createAndSaveSecureKey(password);
          body.security.value.credentials.username = secureUsername.id;
          body.security.value.credentials.password = securePassword.id;
          break;
        }
        case 'bearer': {
          const token = body.security.value.token;
          const secureKey =
            await this.secureKeyService.createAndSaveSecureKey(token);
          body.security.value.token = secureKey.id;
          break;
        }
      }
    }

    const newServer = this.repo.create({
      name: body.name,
      description: body.description,
      security: body.security,
      type: body.type || McpAdapterServerType.Swagger,
    });

    const savedServer = await this.repo.save(newServer);
    savedServer.tools = [];

    for (const toolDto of body.tools) {
      const toolEntity = await this.adapterToolService.createTool(
        toolDto.name,
        toolDto.description,
        toolDto.data,
        savedServer.id,
        toolDto.type || McpAdapterServerType.Swagger,
      );
      savedServer.tools.push(toolEntity);
    }

    return savedServer;
  }

  async getToolsByServerIds(serverIds: string[]) {
    if (!serverIds || serverIds.length === 0) {
      return [];
    }

    const servers = await this.repo.find({
      where: {
        id: In(serverIds),
      },
      relations: ['tools'],
    });

    if (!servers || servers.length === 0) {
      return [];
    }

    return servers.flatMap((server) =>
      server.tools.map((tool) => ({
        tool,
        security: server.security,
      })),
    );
  }

  async getModelToolsByServerIds(serverIds: string[]) {
    const tools = await this.getToolsByServerIds(serverIds);

    return Promise.all(
      tools.map(async ({ tool, security }) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: await this.adapterToolService.buildToolInputJsonSchema(
          tool,
          security,
        ),
      })),
    );
  }
}
