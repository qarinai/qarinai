import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IChatProvider, IChatProviderOriginalModel } from '../_interfaces/chat-provider.interface';
import { buildUrl } from '../../../utils/build-url.util';

@Injectable({
  providedIn: 'root'
})
export class ChatProviderBackendService {
  private http = inject(HttpClient);
  private apiEndpoint = 'chat-providers';

  listChatProviders(): Observable<IChatProvider[]> {
    return this.http.get<IChatProvider[]>(buildUrl(this.apiEndpoint));
  }

  getChatProvider(id: string): Observable<IChatProvider> {
    return this.http.get<IChatProvider>(buildUrl(this.apiEndpoint, id));
  }

  createChatProvider(chatProvider: Partial<IChatProvider>): Observable<IChatProvider> {
    return this.http.post<IChatProvider>(buildUrl(this.apiEndpoint), chatProvider);
  }

  updateChatProvider(id: string, chatProvider: IChatProvider): Observable<IChatProvider> {
    return this.http.put<IChatProvider>(buildUrl(this.apiEndpoint, id), chatProvider);
  }

  deleteChatProvider(id: string): Observable<void> {
    return this.http.delete<void>(buildUrl(this.apiEndpoint, id));
  }

  fetchModels(apiBaseUrl: string, apiKey: string): Observable<IChatProviderOriginalModel[]> {
    return this.http.post<IChatProviderOriginalModel[]>(buildUrl('check-provider'), {
      apiBaseUrl,
      apiKey
    });
  }
}
