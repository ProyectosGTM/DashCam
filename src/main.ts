import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

import { licenseKey } from './devextreme-license';
import config from 'devextreme/core/config';

config({ licenseKey });

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
