import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { AgentsBackendService } from '../_services/agents-backend.service';
import { HttpClient } from '@angular/common/http';
import { IAgent } from '../_interfaces/agent.interface';
import { TagModule } from 'primeng/tag';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { AutoFocusModule } from 'primeng/autofocus';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-list-agents',
  imports: [
    CommonModule,
    ToolbarModule,
    ButtonModule,
    TableModule,
    TagModule,
    RouterModule,
    DialogModule,
    AutoFocusModule,
    InputTextModule
  ],
  providers: [HttpClient, AgentsBackendService],
  templateUrl: './list-agents.component.html',
  styleUrl: './list-agents.component.scss'
})
export class ListAgentsComponent implements OnInit {
  agentsBackendService = inject(AgentsBackendService);
  messagesService = inject(MessageService);
  router = inject(Router);

  agents = signal<IAgent[]>([]);
  isLoading = signal<boolean>(false);

  viewConnectPopup = signal<boolean>(false);
  viewConnectAgent = signal<IAgent | null>(null);

  ngOnInit() {
    this.loadAgents();
  }

  onAddAgentClick() {
    this.router.navigate(['/pages/agents/add']);
  }

  loadAgents() {
    this.isLoading.set(true);
    this.agentsBackendService.listAgents().subscribe({
      next: (agents) => {
        this.agents.set(agents);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading agents:', error);
        this.isLoading.set(false);
      }
    });
  }

  openChatWindow(event: Event, agent: IAgent) {
    event.preventDefault();
    event.stopPropagation();
    open(window.location.origin + '/chat?agentId=' + agent.id, 'popup', 'width=800,height=600');
  }

  openAddToWebsite(event: Event, agent: IAgent) {
    event.preventDefault();
    event.stopPropagation();

    this.viewConnectPopup.set(true);
    this.viewConnectAgent.set(agent);
  }

  getWidgetLink(): string {
    const agent = this.viewConnectAgent();
    const url = window.location.origin + `/widgets/bubble-widget.js?agentId=${agent?.id}`;

    return url;
  }

  getWidgetHtml(): string {
    return `<script src="${this.getWidgetLink()}"></script>`;
  }

  onConnectPopupShow() {
    const widget = this.getWidgetHtml();

    if (window?.navigator?.clipboard) {
      const elm = document.getElementById('widgetText') as HTMLInputElement;
      elm.focus();
      elm.select();
      elm.setSelectionRange(0, 99999); // For mobile devices
      navigator.clipboard
        .writeText(widget)
        .then(() => {
          this.messagesService.add({
            severity: 'success',
            summary: 'Widget Copied',
            detail: 'Widget HTML has been copied to clipboard.'
          });
        })
        .catch((err) => {
          this.messagesService.add({
            severity: 'error',
            summary: 'Copy Failed',
            detail: 'Failed to copy widget HTML to clipboard.'
          });
        });
    }
  }
}
