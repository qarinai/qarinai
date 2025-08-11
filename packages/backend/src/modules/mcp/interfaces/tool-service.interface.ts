import { McpAdapterTool } from '../entities/mcp-adapter-tool.entity';
import { IMcpServerSecurity } from './server-security.interface';

export interface IToolService {
  executeTool(toolEntity: McpAdapterTool, callParams: any): Promise<any>;
  buildToolInputSchema(
    entity: McpAdapterTool,
    security: IMcpServerSecurity,
  ): Record<string, any> | Promise<Record<string, any>>;
}
