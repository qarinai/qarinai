import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { buildUrl } from '../../../utils/build-url.util';
import { IVectorStore } from '../_interfaces/vector-store.interface';

@Injectable({
  providedIn: 'root'
})
export class VectorStoreBackendService {
  private readonly apiEndpoint = 'vector-stores';

  constructor(private readonly http: HttpClient) {}

  listVectorStores() {
    return this.http.get<IVectorStore[]>(buildUrl(this.apiEndpoint));
  }

  createVectorStore(vectorStore: Partial<IVectorStore>) {
    return this.http.post<IVectorStore>(buildUrl(this.apiEndpoint), vectorStore);
  }

  getVectorStore(id: string) {
    return this.http.get<IVectorStore>(buildUrl(this.apiEndpoint, id));
  }

  generateMcpServer(vectorStoreId: string) {
    return this.http.post<IVectorStore>(buildUrl(this.apiEndpoint, vectorStoreId, 'generate-mcp-server'), {});
  }
}
