import { Component, inject, OnInit, signal } from '@angular/core';
import { NumberCardComponent } from '../number-card/number-card.component';
import { DashboardBackendService } from '../../_services/dashboard-backend.service';
import { IDashboardStats } from '../../_interfaces/dashboard.interface';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SettingsBackendService } from '../../../settings/_services/settings-backend.service';
import { SettingKey } from '../../../settings/_interfaces/settings.interface';

@Component({
  selector: 'app-stats',
  imports: [NumberCardComponent, RouterModule],
  providers: [SettingsBackendService],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {
  private service = inject(DashboardBackendService);
  private settingService = inject(SettingsBackendService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal<boolean>(true);
  stats = signal<IDashboardStats | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats() {
    this.loading.set(true);
    this.service.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);

        if (data.llmProviders > 0) {
          this.checkSettings();
        } else {
          this.notifyNoLlmProviders();
        }
      },
      error: () => {
        this.loading.set(false);
        this.stats.set(null);
      }
    });
  }

  private checkSettings() {
    this.settingService.listAllSettings().subscribe((settings) => {
      if (!settings.some((setting) => setting.key === SettingKey.DefaultLlmModel)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Settings Warning',
          detail: 'Please configure the required settings for the application to function properly.'
        });
        this.router.navigate(['/pages/settings']);
      }
    });
  }

  private notifyNoLlmProviders() {
    this.messageService.add({
      severity: 'warn',
      summary: 'No LLM Providers',
      detail: 'Please add an LLM provider to get started.'
    });

    this.router.navigate(['/pages/llm-providers']);
  }
}
