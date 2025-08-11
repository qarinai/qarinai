import {
  ApplicationConfig,
  inject,
  Injector,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { createCustomElement } from '@angular/elements';
import { Bubble } from './components/bubble/bubble';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideMarkdown(),
    provideEnvironmentInitializer(() => {
      const injector = inject(Injector);
      const elm = createCustomElement(Bubble, {
        injector: injector,
      });
      customElements.define('qarinai-bubble', elm);
    }),
  ],
};
