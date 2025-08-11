import { Component, effect, EffectRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { VectorStoreBackendService } from '../_services/vector-store-backend.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IVectorStore } from '../_interfaces/vector-store.interface';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { AddSourceComponent } from '../_components/add-source/add-source.component';
import { InfoHelpComponent } from '../../../utils/components/info-help/info-help.component';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { VectorStoreStatus } from '../_enums/vector-store-status.enum';
import { delay } from 'lodash';

@Component({
  selector: 'app-view-vector-store',
  imports: [
    RouterModule,
    CardModule,
    TagModule,
    TableModule,
    ButtonModule,
    CommonModule,
    Dialog,
    AddSourceComponent,
    InfoHelpComponent,
    MarkdownModule
  ],
  templateUrl: './view-vector-store.component.html',
  styleUrl: './view-vector-store.component.scss'
})
export class ViewVectorStoreComponent implements OnInit {
  private vectorStoreBackendService = inject(VectorStoreBackendService);
  private activatedRoute = inject(ActivatedRoute);
  private http = inject(HttpClient);
  vectorStoreId!: string;

  vectorStoreDetails = signal<IVectorStore | null>(null);
  isLoading = signal<boolean>(true);

  addSourceVisible = signal<boolean>(false);

  howToUseVisible = signal<boolean>(false);
  howToUseText = signal<string>('');

  constructor() {
    effect(
      (cleanup) => {
        const storeDetails = this.vectorStoreDetails();
        let delayId: number;
        if (storeDetails && storeDetails.status === VectorStoreStatus.InProgress) {
          delayId = delay(() => {
            this.loadVectorStoreDetails(this.vectorStoreId);
          }, 2000);
        }

        return cleanup(() => {
          if (delayId) {
            clearTimeout(delayId);
          }
        });
      },
      {
        manualCleanup: false
      }
    );
  }

  ngOnInit(): void {
    this.vectorStoreId = this.getVectorStoreIdFromRoute();
    if (this.vectorStoreId) {
      this.loadVectorStoreDetails(this.vectorStoreId);
    } else {
      console.error('No vector store ID found in route');
    }
  }

  private getVectorStoreIdFromRoute(): string {
    return this.activatedRoute.snapshot.paramMap.get('id') ?? '';
  }

  loadVectorStoreDetails(id: string): void {
    this.isLoading.set(true);
    this.vectorStoreBackendService.getVectorStore(id).subscribe({
      next: (vectorStore) => {
        this.vectorStoreDetails.set(vectorStore);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading vector store details:', error);
        this.isLoading.set(false);
      }
    });
  }

  showAddSourceDialog() {
    this.addSourceVisible.set(true);
  }

  hideAddSourceDialog() {
    this.addSourceVisible.set(false);
    this.loadVectorStoreDetails(this.vectorStoreId!);
  }

  showHowToUseDialog() {
    this.http.get('/info/vector-store-usage.info.md', { responseType: 'text' }).subscribe({
      next: (data) => {
        this.howToUseVisible.set(true);
        const info = data.replace('http://[YOUR_BASEURL]', window.origin).replace('[STORE_ID]', this.vectorStoreId);
        this.howToUseText.set(info);
      },
      error: (error) => {
        console.error('Error loading how-to-use information:', error);
      }
    });
  }

  createMcpServer() {
    this.isLoading.set(true);
    this.vectorStoreBackendService.generateMcpServer(this.vectorStoreId).subscribe({
      next: (vectorStore) => {
        this.vectorStoreDetails.set(vectorStore);
      },
      error: (error) => {
        console.error('Error generating MCP server:', error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
