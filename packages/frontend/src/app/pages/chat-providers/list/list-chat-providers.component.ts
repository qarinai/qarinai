import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IChatProvider } from '../_interfaces/chat-provider.interface';
import { ChatProviderBackendService } from '../_services/chat-provider-backend.service';

@Component({
  selector: 'app-list-chat-providers',
  imports: [ToolbarModule, ButtonModule, TableModule, TagModule, RouterModule, CommonModule],
  providers: [HttpClient, ChatProviderBackendService],
  templateUrl: './list-chat-providers.component.html',
  styleUrl: './list-chat-providers.component.scss'
})
export class ListChatProvidersComponent implements OnInit {
  chatProviderBackendService: ChatProviderBackendService = inject(ChatProviderBackendService);
  router = inject(Router);

  chatProviders = signal<IChatProvider[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadChatProviders();
  }

  onAddChatProviderClick() {
    this.router.navigate(['/pages/chat-providers/add']);
  }

  loadChatProviders() {
    this.isLoading.set(true);
    this.chatProviderBackendService.listChatProviders().subscribe({
      next: (providers) => {
        this.chatProviders.set(providers);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading chat providers:', error);
        this.isLoading.set(false);
      }
    });
  }
}
