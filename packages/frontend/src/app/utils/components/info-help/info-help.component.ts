import { Component, computed, input, signal } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-info-help',
  imports: [ButtonModule, TooltipModule, DialogModule, MarkdownModule],
  templateUrl: './info-help.component.html',
  styleUrl: './info-help.component.scss'
})
export class InfoHelpComponent {
  tooltipText = input('Click for more information');
  infoMdFile = input<string>();
  infoMdText = input<string>('');

  visible = signal(false);

  infoFileFullPath = computed(() => {
    if (this.infoMdFile()) {
      return `/info/${this.infoMdFile()}.info.md`;
    }
    return null;
  });

  onInfoClick($event: MouseEvent) {
    $event.stopPropagation();
    this.visible.set(true);
  }
}
