import { Component } from '@angular/core';
import { version } from '../../../../package.json';

@Component({
  standalone: true,
  selector: 'app-footer',
  template: `<div class="layout-footer">
    <div class="layout-footer-content">
      <span class="footer-text"
        >&copy; <a href="https://qarin.ai" target="_blank" rel="noopener noreferrer">Qarīn.ai</a> 2025</span
      >
      -
      <span class="footer-text">Version: {{ version }}</span>
      -
      <span class="footer-text">
        Developed with ❤️ by
        <a href="https://sayedmahmoud266.website" target="_blank" rel="noopener noreferrer">Sayed Mahmoud Sayed</a>
      </span>
    </div>
  </div>`
})
export class AppFooter {
  version: string = version;
}
