import { ILlmProviderModel } from '../../llm-providers/_interfaces/llm-provider.interface';
import { IMcpServer } from '../../mcp-servers/_interfaces/mcp-server.interface';

export interface IAgent {
  id: string;
  name: string;
  description: string;
  identityMessage: string;
  systemMessage: string;
  defaultModel: ILlmProviderModel;
  allowedModels: ILlmProviderModel[];
  linkedMCPServers: IMcpServer[];
  isActive: boolean;
  metadata: any;
}
