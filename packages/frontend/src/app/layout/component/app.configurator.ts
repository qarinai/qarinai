import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { $t } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';
import Nora from '@primeng/themes/nora';
import { PrimeNG } from 'primeng/config';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LayoutService } from '../service/layout.service';
import { preset as defaultPreset } from '../layout.config';

const presets = {
  Aura,
  Lara,
  Nora
} as const;

declare type KeyOfType<T> = keyof T extends infer U ? U : never;

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectButtonModule],
  template: `
    <div class="flex flex-col gap-4">
      <div *ngIf="showMenuModeButton()" class="flex flex-col gap-2">
        <span class="text-sm text-muted-color font-semibold">Menu Mode</span>
        <p-selectbutton
          [ngModel]="menuMode()"
          (ngModelChange)="onMenuModeChange($event)"
          [options]="menuModeOptions"
          [allowEmpty]="false"
          size="small"
        />
      </div>
    </div>
  `,
  host: {
    class:
      'hidden absolute top-[3.25rem] right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]'
  }
})
export class AppConfigurator {
  router = inject(Router);
  config: PrimeNG = inject(PrimeNG);
  layoutService: LayoutService = inject(LayoutService);
  platformId = inject(PLATFORM_ID);
  primeng = inject(PrimeNG);

  presets = Object.keys(presets);
  showMenuModeButton = signal(!this.router.url.includes('auth'));

  menuModeOptions = [
    { label: 'Static', value: 'static' },
    { label: 'Overlay', value: 'overlay' }
  ];

  selectedPreset = computed(() => this.layoutService.layoutConfig().preset);
  menuMode = computed(() => this.layoutService.layoutConfig().menuMode);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.onPresetChange(this.layoutService.layoutConfig().preset);
    }
  }

  // Fixed color scheme for both light and dark modes
  private getFixedColorScheme() {
    return defaultPreset;
  }

  onPresetChange(event: any) {
    this.layoutService.layoutConfig.update((state) => ({ ...state, preset: event }));
    const preset = presets[event as KeyOfType<typeof presets>];
    $t().preset(preset).preset(this.getFixedColorScheme()).use({ useDefaultOptions: true });
  }

  onMenuModeChange(event: string) {
    this.layoutService.layoutConfig.update((prev) => ({ ...prev, menuMode: event }));
  }
}
