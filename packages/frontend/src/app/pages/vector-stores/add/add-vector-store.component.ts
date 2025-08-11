import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { VectorStoreBackendService } from '../_services/vector-store-backend.service';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-vector-store',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CardModule, InputTextModule, ButtonModule, RouterModule],
  templateUrl: './add-vector-store.component.html',
  styleUrl: './add-vector-store.component.scss'
})
export class AddVectorStoreComponent implements OnInit {
  private vecctorStoreBackendService = inject(VectorStoreBackendService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  vectorStoreForm!: FormGroup;

  ngOnInit(): void {
    this.vectorStoreForm = this.fb.group({
      name: ['', [Validators.required]],
      summary: ['', [Validators.required]]
    });
  }

  save() {
    if (this.vectorStoreForm.invalid) {
      this.vectorStoreForm.markAllAsTouched();
      this.vectorStoreForm.updateValueAndValidity();
      return;
    }

    const vectorStoreData = this.vectorStoreForm.value;

    this.vecctorStoreBackendService.createVectorStore(vectorStoreData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Vector store created successfully!'
        });
        this.router.navigate(['/pages/vector-stores']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create vector store. Please try again.'
        });
        console.error('Error creating vector store:', error);
      }
    });
  }
}
