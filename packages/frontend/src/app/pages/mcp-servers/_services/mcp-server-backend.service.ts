import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IMcpServer } from '../_interfaces/mcp-server.interface';
import { buildUrl } from '../../../utils/build-url.util';

@Injectable()
export class McpServerBackendService {
  private readonly apiEndpoint = 'mcp-servers';

  constructor(private readonly http: HttpClient) {}

  listMcpServers() {
    return this.http.get<IMcpServer[]>(buildUrl(this.apiEndpoint));
  }

  createMcpServer(server: IMcpServer) {
    return this.http.post<IMcpServer>(buildUrl(this.apiEndpoint), server);
  }
}
