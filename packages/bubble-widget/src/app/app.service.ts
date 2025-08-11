import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IAgent } from './interfaces/agent.interface';

declare global {
  interface Window {
    qarinai: {};
  }

  namespace globalThis {
    var _NGX_ENV_: {
      NG_APP_DEV_BASE_URL?: string;
      NG_APP_DEV_AGENT_ID?: string;
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private baseUrl: string;
  private agentId: string;
  private http = inject(HttpClient);

  constructor() {
    this.baseUrl = this.getBaseurlFromScript() || this.getDevBaseUrl() || '';
    this.agentId = this.getAgentIdFromScript() || this.getDevAgentId() || '';
  }

  getAgentId() {
    return this.agentId;
  }
  getBaseUrl() {
    return this.baseUrl;
  }

  getAgentDetails() {
    return this.http.get<IAgent>(this.buildUrl('api', 'agents', this.agentId));
  }

  messageAgent(agentId: string, content: string, conversationId?: string) {
    const body = {
      content,
      conversationId,
    };

    return this.http.post(
      this.buildUrl('api', 'agents', agentId, 'chat', 'messages'),
      body,
      {
        observe: 'events',
        responseType: 'text',
        reportProgress: true,
      }
    );
  }

  private buildUrl(...segments: string[]) {
    if (!this.baseUrl) {
      throw new Error('Base URL is not set');
    }
    const url = new URL(this.baseUrl);
    segments.forEach((segment) => {
      if (segment) {
        url.pathname = `${url.pathname.replace(/\/$/, '')}/${segment.replace(
          /^\//,
          ''
        )}`;
      }
    });
    return url.toString();
  }

  private getBaseurlFromScript() {
    const src = (document.currentScript as HTMLScriptElement)?.src || '';
    if (src) {
      const url = new URL(src);
      return url.origin;
    }
    return '';
  }

  private getAgentIdFromScript() {
    const src = (document.currentScript as HTMLScriptElement)?.src || '';
    if (src) {
      const url = new URL(src);
      return url.searchParams.get('agentId') || '';
    }
    return '';
  }

  private getDevBaseUrl() {
    try {
      return globalThis._NGX_ENV_?.NG_APP_DEV_BASE_URL || '';
    } catch {
      return null;
    }
  }

  private getDevAgentId() {
    try {
      return globalThis._NGX_ENV_?.NG_APP_DEV_AGENT_ID || '';
    } catch {
      return null;
    }
  }
}
