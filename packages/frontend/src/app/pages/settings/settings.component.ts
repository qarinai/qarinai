import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SettingsBackendService } from './_services/settings-backend.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SettingKey } from './_interfaces/settings.interface';
import { ChatProviderBackendService } from '../chat-providers/_services/chat-provider-backend.service';
import { IChatProvider } from '../chat-providers/_interfaces/chat-provider.interface';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, ButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settingBackendService = inject(SettingsBackendService);
  chatProviderBackendService = inject(ChatProviderBackendService);
  fb = inject(FormBuilder);

  chatProviders = signal<IChatProvider[]>([]);

  settingsLoading = signal<boolean>(true);
  chatProvidersLoading = signal<boolean>(true);

  allLoading = computed(() => this.settingsLoading() || this.chatProvidersLoading());

  settingsForm = this.fb.group({
    defaultChatProvider: [''],
    defaultChatModel: ['']
    // defaultEmbeddingModel: ['']
  });

  ngOnInit(): void {
    this.loadSettingValues();
    this.loadChatProviders();
  }

  saveSettings() {
    const settingsToUpdate = [
      {
        key: SettingKey.DefaultChatProvider,
        value: this.settingsForm.value.defaultChatProvider || ''
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
        defaultChatProvider: settings.find((s) => s.key === SettingKey.DefaultChatProvider)?.value || '',
        defaultChatModel: settings.find((s) => s.key === SettingKey.DefaultChatModel)?.value || ''
        // defaultEmbeddingModel: settings.find(s => s.key === 'default_embedding_model')?.value || ''
      };
      this.settingsForm.patchValue(formValues);
    });
  }

  private loadChatProviders() {
    this.chatProvidersLoading.set(true);
    this.chatProviderBackendService.listChatProviders().subscribe((providers) => {
      this.chatProvidersLoading.set(false);
      this.chatProviders.set(providers);
    });
  }
}
