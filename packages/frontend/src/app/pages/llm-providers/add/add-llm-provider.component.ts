import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, model, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ILlmProvider, ILlmProviderModel } from '../_interfaces/llm-provider.interface';
import { LlmProviderBackendService } from '../_services/llm-provider-backend.service';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { InfoHelpComponent } from '../../../utils/components/info-help/info-help.component';

@Component({
  selector: 'app-add-llm-provider',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DividerModule,
    CheckboxModule,
    InfoHelpComponent
  ],
  providers: [],
  templateUrl: './add-llm-provider.component.html',
  styleUrl: './add-llm-provider.component.scss'
})
export class AddLlmProviderComponent implements OnInit {
  private llmProviderService = inject(LlmProviderBackendService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private router = inject(Router);

  llmProviderForm!: FormGroup;
  models = signal<string[]>([]);
  isLoadingModels = signal<boolean>(false);
  isModelsLoaded = signal<boolean>(false);
  selectedModels = model<string[]>([]);
  isSaving = signal<boolean>(false);
  isAllModelsSelected = computed(() => {
    return this.selectedModels().length === this.models().length && this.models().length > 0;
  });

  ngOnInit(): void {
    this.llmProviderForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      apiBaseUrl: ['', [Validators.required, Validators.pattern('^https?://.*')]],
      apiKey: ['', [Validators.required]]
    });
  }

  fetchModels(): void {
    if (this.llmProviderForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please provide valid API Base URL and API Key'
      });
      return;
    }

    const apiBaseUrl = this.llmProviderForm.get('apiBaseUrl')?.value;
    const apiKey = this.llmProviderForm.get('apiKey')?.value;

    this.isLoadingModels.set(true);
    this.llmProviderService.fetchModels(apiBaseUrl, apiKey).subscribe({
      next: (models: any) => {
        this.models.set(models.map((m: any) => m.id));
        this.selectedModels.set(models.map((m: any) => m.id));
        this.isModelsLoaded.set(true);
        this.isLoadingModels.set(false);
      },
      error: (error: any) => {
        console.error('Error fetching models:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch models. Please check your API URL and key.'
        });
        this.isLoadingModels.set(false);
      }
    });
  }

  save(): void {
    if (!this.isModelsLoaded()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fetch models before saving the LLM provider'
      });
      return;
    }

    if (this.selectedModels().length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select at least one model'
      });
      return;
    }

    this.isSaving.set(true);

    const llmProvider: Partial<ILlmProvider> = {
      name: this.llmProviderForm.get('name')?.value,
      protocol: 'openai',
      apiBaseUrl: this.llmProviderForm.get('apiBaseUrl')?.value,
      apiKey: this.llmProviderForm.get('apiKey')?.value,
      models: this.selectedModels() as any
    };

    this.llmProviderService.createLlmProvider(llmProvider).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'LLM provider has been created successfully'
        });
        this.isSaving.set(false);
        // Navigate back to the list page after a short delay
        setTimeout(() => {
          this.router.navigate(['/pages/llm-providers']);
        }, 1500);
      },
      error: (error: any) => {
        console.error('Error creating LLM provider:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create LLM provider'
        });
        this.isSaving.set(false);
      }
    });
  }

  selectAll(event: CheckboxChangeEvent): void {
    console.log('Select all models:', event);
    if (event?.checked) {
      this.selectedModels.set(this.models());
    } else {
      this.selectedModels.set([]);
    }
  }
}
