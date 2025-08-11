import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, model, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { IChatProvider, IChatProviderModel } from '../_interfaces/chat-provider.interface';
import { ChatProviderBackendService } from '../_services/chat-provider-backend.service';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { InfoHelpComponent } from '../../../utils/components/info-help/info-help.component';

@Component({
  selector: 'app-add-chat-provider',
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
  templateUrl: './add-chat-provider.component.html',
  styleUrl: './add-chat-provider.component.scss'
})
export class AddChatProviderComponent implements OnInit {
  private chatProviderService = inject(ChatProviderBackendService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private router = inject(Router);

  chatProviderForm!: FormGroup;
  models = signal<string[]>([]);
  isLoadingModels = signal<boolean>(false);
  isModelsLoaded = signal<boolean>(false);
  selectedModels = model<string[]>([]);
  isSaving = signal<boolean>(false);
  isAllModelsSelected = computed(() => {
    return this.selectedModels().length === this.models().length && this.models().length > 0;
  });

  ngOnInit(): void {
    this.chatProviderForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      apiBaseUrl: ['', [Validators.required, Validators.pattern('^https?://.*')]],
      apiKey: ['', [Validators.required]]
    });
  }

  fetchModels(): void {
    if (this.chatProviderForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please provide valid API Base URL and API Key'
      });
      return;
    }

    const apiBaseUrl = this.chatProviderForm.get('apiBaseUrl')?.value;
    const apiKey = this.chatProviderForm.get('apiKey')?.value;

    this.isLoadingModels.set(true);
    this.chatProviderService.fetchModels(apiBaseUrl, apiKey).subscribe({
      next: (models) => {
        this.models.set(models.map((m) => m.id));
        this.selectedModels.set(models.map((m) => m.id));
        this.isModelsLoaded.set(true);
        this.isLoadingModels.set(false);
      },
      error: (error) => {
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
        detail: 'Please fetch models before saving the chat provider'
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

    const chatProvider: Partial<IChatProvider> = {
      name: this.chatProviderForm.get('name')?.value,
      protocol: 'openai',
      apiBaseUrl: this.chatProviderForm.get('apiBaseUrl')?.value,
      apiKey: this.chatProviderForm.get('apiKey')?.value,
      models: this.selectedModels() as any
    };

    this.chatProviderService.createChatProvider(chatProvider).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Chat provider has been created successfully'
        });
        this.isSaving.set(false);
        // Navigate back to the list page after a short delay
        setTimeout(() => {
          this.router.navigate(['/pages/chat-providers']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating chat provider:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create chat provider'
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
