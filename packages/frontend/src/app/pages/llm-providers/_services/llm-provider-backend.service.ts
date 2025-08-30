import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ILlmProvider, ILlmProviderOriginalModel } from '../_interfaces/llm-provider.interface';
import { buildUrl } from '../../../utils/build-url.util';

@Injectable({
  providedIn: 'root'
})
export class LlmProviderBackendService {
  private http = inject(HttpClient);
  private apiEndpoint = 'llm-providers';

  listLlmProviders(): Observable<ILlmProvider[]> {
    return this.http.get<ILlmProvider[]>(buildUrl(this.apiEndpoint));
  }

  getLlmProvider(id: string): Observable<ILlmProvider> {
    return this.http.get<ILlmProvider>(buildUrl(this.apiEndpoint, id));
  }

  createLlmProvider(llmProvider: Partial<ILlmProvider>): Observable<ILlmProvider> {
    return this.http.post<ILlmProvider>(buildUrl(this.apiEndpoint), llmProvider);
  }

  updateLlmProvider(id: string, llmProvider: ILlmProvider): Observable<ILlmProvider> {
    return this.http.put<ILlmProvider>(buildUrl(this.apiEndpoint, id), llmProvider);
  }

  deleteLlmProvider(id: string): Observable<void> {
    return this.http.delete<void>(buildUrl(this.apiEndpoint, id));
  }

  fetchModels(apiBaseUrl: string, apiKey: string): Observable<ILlmProviderOriginalModel[]> {
    return this.http.post<ILlmProviderOriginalModel[]>(buildUrl('check-provider'), {
      apiBaseUrl,
      apiKey
    });
  }
}
