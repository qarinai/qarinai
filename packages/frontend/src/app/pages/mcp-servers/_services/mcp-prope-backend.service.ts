import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { buildUrl } from '../../../utils/build-url.util';

@Injectable({
  providedIn: 'root'
})
export class McpPropeBackendService {
  private readonly apiEndpoint = 'mcp-prope';

  constructor(private readonly http: HttpClient) {}

  listMcpTools(body: { url: string; token?: string; tokenType?: string }) {
    return this.http.post<any[]>(buildUrl(this.apiEndpoint, 'list-tools'), body);
  }
}
