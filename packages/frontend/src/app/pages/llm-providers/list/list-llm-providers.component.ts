import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ILlmProvider } from '../_interfaces/llm-provider.interface';
import { LlmProviderBackendService } from '../_services/llm-provider-backend.service';

@Component({
  selector: 'app-list-llm-providers',
  imports: [ToolbarModule, ButtonModule, TableModule, TagModule, RouterModule, CommonModule],
  providers: [HttpClient, LlmProviderBackendService],
  templateUrl: './list-llm-providers.component.html',
  styleUrl: './list-llm-providers.component.scss'
})
export class ListLlmProvidersComponent implements OnInit {
  llmProviderBackendService: LlmProviderBackendService = inject(LlmProviderBackendService);
  router = inject(Router);

  llmProviders = signal<ILlmProvider[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadLlmProviders();
  }

  onAddLlmProviderClick() {
    this.router.navigate(['/pages/llm-providers/add']);
  }

  loadLlmProviders() {
    this.isLoading.set(true);
    this.llmProviderBackendService.listLlmProviders().subscribe({
      next: (providers) => {
        this.llmProviders.set(providers);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading llm providers:', error);
        this.isLoading.set(false);
      }
    });
  }
}
