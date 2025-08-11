import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestApiCallToolService } from './services/tools/rest-api-call.tool.service';
import { McpServerController } from './controllers/mcp-server.controller';

import { McpAdapterServer } from './entities/mcp-adapter-server.entity';
import { McpAdapterTool } from './entities/mcp-adapter-tool.entity';
import { McpAdapterToolService } from './services/mcp-adapter-tool.service';
import { McpAdapterServerService } from './services/mcp-adapter-server.service';
import { McpPropeService } from './services/mcp-prope.service';
import { McpPropeController } from './controllers/mcp-prope.controller';
import { McpProxyCallToolService } from './services/tools/mcp-proxy-call.tool.service';
import { McpSearchVectorStoreToolService } from './services/tools/mcp-search-vector-store.tool.service';
import { VectorStoreModule } from '../vector-store/vector-store.module';

@Module({
  controllers: [McpServerController, McpPropeController],
  imports: [
    TypeOrmModule.forFeature([McpAdapterServer, McpAdapterTool]),
    forwardRef(() => VectorStoreModule),
  ],
  providers: [
    RestApiCallToolService,
    McpProxyCallToolService,
    McpSearchVectorStoreToolService,
    McpAdapterToolService,
    McpAdapterServerService,
    McpPropeService,
  ],
  exports: [McpAdapterServerService, McpAdapterToolService],
})
export class McpModule {}
