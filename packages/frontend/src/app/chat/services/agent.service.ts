import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { buildUrl } from '../../utils/build-url.util';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private readonly endPoint = 'agents';

  constructor(private readonly http: HttpClient) {}

  getAgentById(agentId: string) {
    return this.http.get(buildUrl(this.endPoint, agentId));
  }

  messageAgent(agentId: string, content: string, conversationId?: string) {
    const body = {
      content,
      conversationId
    };

    return this.http.post(buildUrl(this.endPoint, agentId, 'chat', 'messages'), body, {
      observe: 'events',
      responseType: 'text',
      reportProgress: true
    });
  }
}
