import { CommonModule } from '@angular/common';
import { Component, Inject, inject, Input, input, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { IFile } from '../../_interfaces/file.interface';
import { TableModule } from 'primeng/table';
import { VectorStoreSourceBackendService } from '../../_services/vector-store-source-backend.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-source',
  imports: [FileUploadModule, CommonModule, ButtonModule, TableModule],
  templateUrl: './add-source.component.html',
  styleUrl: './add-source.component.scss'
})
export class AddSourceComponent implements OnInit {
  private readonly backendService = inject(VectorStoreSourceBackendService);

  @Input()
  dialogRef!: Dialog;

  @Input()
  storeId!: string;

  sourceFiles = signal<IFile[]>([]);

  ngOnInit(): void {}

  closeModal(e: Event) {
    e.stopPropagation();
    this.dialogRef.close(e);
  }

  onUploadFinished(e: any) {
    const files = e.originalEvent.body;
    this.sourceFiles.set([...this.sourceFiles(), ...files]);
  }

  removeFile(file: IFile) {
    const updatedFiles = this.sourceFiles().filter((f) => f.id !== file.id);
    this.sourceFiles.set(updatedFiles);
  }

  saveSources(e: Event) {
    const sources = this.sourceFiles().map((file) => ({
      fileId: file.id,
      name: file.name,
      storeId: this.storeId
    }));

    if (sources.length === 0) {
      console.warn('No sources to save');
      return;
    }

    forkJoin(sources.map((source) => this.backendService.createSource(source))).subscribe({
      next: () => {
        this.sourceFiles.set([]);
        this.dialogRef.close(e);
      },
      error: (error) => {
        console.error('Error saving sources:', error);
      }
    });
  }
}
