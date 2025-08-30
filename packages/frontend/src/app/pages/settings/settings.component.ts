import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SettingsBackendService } from './_services/settings-backend.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SettingKey } from './_interfaces/settings.interface';
import { LlmProviderBackendService } from '../llm-providers/_services/llm-provider-backend.service';
import { ILlmProvider } from '../llm-providers/_interfaces/llm-provider.interface';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, ButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settingBackendService = inject(SettingsBackendService);
  llmProviderBackendService = inject(LlmProviderBackendService);
  fb = inject(FormBuilder);

  llmProviders = signal<ILlmProvider[]>([]);

  settingsLoading = signal<boolean>(true);
  llmProvidersLoading = signal<boolean>(true);

  allLoading = computed(() => this.settingsLoading() || this.llmProvidersLoading());

  settingsForm = this.fb.group({
    defaultLlmProvider: [''],
    defaultChatModel: ['']
    // defaultEmbeddingModel: ['']
  });

  ngOnInit(): void {
    this.loadSettingValues();
    this.loadLlmProviders();
  }

  saveSettings() {
    const settingsToUpdate = [
      {
        key: SettingKey.DefaultLlmProvider,
        value: this.settingsForm.value.defaultLlmProvider || ''
      },
      {
        key: SettingKey.DefaultChatModel,
        value: this.settingsForm.value.defaultChatModel || ''
      }
      // {
      //   key: 'default_embedding_model',
      //   value: this.settingsForm.value.defaultEmbeddingModel || ''
      // }
    ].filter((setting) => setting.value);

    settingsToUpdate.forEach((setting) => {
      this.settingBackendService.setSetting(setting).subscribe({
        next: () => console.log(`Setting ${setting.key} updated successfully`),
        error: (err) => console.error(`Error updating setting ${setting.key}:`, err)
      });
    });
  }

  private loadSettingValues() {
    this.settingsLoading.set(true);
    this.settingBackendService.listAllSettings().subscribe((settings) => {
      this.settingsLoading.set(false);
      const formValues = {
        defaultLlmProvider: settings.find((s) => s.key === SettingKey.DefaultLlmProvider)?.value || '',
        defaultChatModel: settings.find((s) => s.key === SettingKey.DefaultChatModel)?.value || ''
        // defaultEmbeddingModel: settings.find(s => s.key === 'default_embedding_model')?.value || ''
      };
      this.settingsForm.patchValue(formValues);
    });
  }

  private loadLlmProviders() {
    this.llmProvidersLoading.set(true);
    this.llmProviderBackendService.listLlmProviders().subscribe((providers: any) => {
      this.llmProvidersLoading.set(false);
      this.llmProviders.set(providers);
    });
  }
}
