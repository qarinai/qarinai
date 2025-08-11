import { IChatProviderModel } from '../../chat-providers/_interfaces/chat-provider.interface';
import { IMcpServer } from '../../mcp-servers/_interfaces/mcp-server.interface';

export interface IAgent {
  id: string;
  name: string;
  description: string;
  identityMessage: string;
  systemMessage: string;
  defaultModel: IChatProviderModel;
  allowedModels: IChatProviderModel[];
  linkedMCPServers: IMcpServer[];
  isActive: boolean;
  metadata: any;
}
