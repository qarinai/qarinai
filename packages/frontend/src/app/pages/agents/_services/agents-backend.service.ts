import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { buildUrl } from '../../../utils/build-url.util';
import { IAgent } from '../_interfaces/agent.interface';

@Injectable({
  providedIn: 'root'
})
export class AgentsBackendService {
  private http = inject(HttpClient);
  private apiEndpoint = 'agents';

  getAgentById(id: string) {
    return this.http.get<IAgent>(buildUrl(`${this.apiEndpoint}/${id}`));
  }

  listAgents() {
    return this.http.get<IAgent[]>(buildUrl(this.apiEndpoint));
  }

  createAgent(agent: any) {
    return this.http.post<IAgent>(buildUrl(this.apiEndpoint), agent);
  }

  updateAgent(id: string, agent: any) {
    return this.http.put<IAgent>(buildUrl(this.apiEndpoint, id), agent);
  }
}
