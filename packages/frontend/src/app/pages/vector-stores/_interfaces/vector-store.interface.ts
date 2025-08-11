import { IMcpServer } from '../../mcp-servers/_interfaces/mcp-server.interface';
import { VectorStoreStatus } from '../_enums/vector-store-status.enum';

export interface IVectorStoreSource {
  id: string;
  summary: string;
  type: string;
  status: string;
  metadata: Record<string, any>;
}

export interface IVectorStore {
  id: string;
  name: string;
  summary: string;
  status: VectorStoreStatus;
  sources: IVectorStoreSource[];
  mcpServer?: IMcpServer;
}
