import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppService } from './app/app.service';

createApplication(appConfig)
  .then((app) => {
    app.injector.get(AppService);

    window.addEventListener('load', () => {
      const elm = document.createElement('qarinai-bubble');
      document.body.appendChild(elm);
    });
  })
  .catch((err) => console.error(err));
