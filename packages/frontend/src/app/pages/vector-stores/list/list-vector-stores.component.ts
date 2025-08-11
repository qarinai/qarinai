import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { VectorStoreBackendService } from '../_services/vector-store-backend.service';
import { IVectorStore } from '../_interfaces/vector-store.interface';
import { VectorStoreStatus } from '../_enums/vector-store-status.enum';

@Component({
  selector: 'app-list-vector-stores',
  imports: [ToolbarModule, ButtonModule, TableModule, TagModule, RouterModule],
  templateUrl: './list-vector-stores.component.html',
  styleUrl: './list-vector-stores.component.scss'
})
export class ListVectorStoresComponent implements OnInit {
  vectorStoreBackendService = inject(VectorStoreBackendService);
  router = inject(Router);

  vectorStores = signal<IVectorStore[]>([]);
  isLoading = signal<boolean>(false);

  VectorStoreStatus = VectorStoreStatus;

  ngOnInit(): void {
    this.loadVectorStores();
  }

  onAddVectorStoreClick() {
    this.router.navigate(['/pages/vector-stores/add']);
  }

  loadVectorStores() {
    this.isLoading.set(true);
    this.vectorStoreBackendService.listVectorStores().subscribe({
      next: (stores) => {
        this.vectorStores.set(stores);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading vector stores:', error);
        this.isLoading.set(false);
      }
    });
  }

  viewVectorStore(vectorStore: IVectorStore) {
    this.router.navigate(['/pages/vector-stores', vectorStore.id]);
  }
}
