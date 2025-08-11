import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IMcpServer } from '../_interfaces/mcp-server.interface';
import { HttpClient } from '@angular/common/http';
import { McpServerBackendService } from '../_services/mcp-server-backend.service';
import { Router, RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { AutoFocusModule } from 'primeng/autofocus';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { McpTypeComponent } from '../_components/mcp-type/mcp-type.component';

@Component({
  selector: 'app-list-mcp-servers',
  imports: [
    ToolbarModule,
    ButtonModule,
    TableModule,
    TagModule,
    RouterModule,
    DialogModule,
    AutoFocusModule,
    InputTextModule,
    McpTypeComponent
  ],
  providers: [HttpClient, McpServerBackendService],
  templateUrl: './list-mcp-servers.component.html',
  styleUrl: './list-mcp-servers.component.scss'
})
export class ListMcpServersComponent implements OnInit {
  mcpServerBackendService: McpServerBackendService = inject(McpServerBackendService);
  messagesService = inject(MessageService);
  router = inject(Router);

  mcpServers = signal<IMcpServer[]>([]);
  isLoading = signal<boolean>(false);

  viewConnectPopup = signal<boolean>(false);
  viewConnectServer = signal<IMcpServer | null>(null);

  ngOnInit(): void {
    this.loadMcpServers();
  }

  onAddServerClick() {
    this.router.navigate(['/pages/mcp-servers/add']);
  }

  loadMcpServers() {
    this.isLoading.set(true);
    this.mcpServerBackendService.listMcpServers().subscribe({
      next: (servers) => {
        this.mcpServers.set(servers);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading MCP servers:', error);
        this.isLoading.set(false);
      }
    });
  }

  openConnectPopup(server: IMcpServer) {
    this.viewConnectPopup.set(true);
    this.viewConnectServer.set(server);
  }

  getMcpServerUrl(): string {
    const server = this.viewConnectServer();
    const url = window.location.origin + `/api/mcp-servers/${server?.id}/mcp`;

    return url;
  }

  onConnectPopupShow() {
    const url = this.getMcpServerUrl();
    if (window?.navigator?.clipboard) {
      const elm = document.getElementById('mcpServerUrl') as HTMLInputElement;
      elm.focus();
      elm.select();
      elm.setSelectionRange(0, 99999); // For mobile devices
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.messagesService.add({
            severity: 'success',
            summary: 'URL Copied',
            detail: 'MCP server URL has been copied to clipboard.'
          });
        })
        .catch((err) => {
          this.messagesService.add({
            severity: 'error',
            summary: 'Copy Failed',
            detail: 'Failed to copy MCP server URL to clipboard.'
          });
        });
    }
  }
}
