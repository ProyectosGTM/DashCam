import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

import { licenseKey } from './devextreme-license';
import config from 'devextreme/core/config';
import { provideAnimations } from '@angular/platform-browser/animations';  // ✅ NUEVO

config({ licenseKey });

// ✅ Aquí solo agregamos animaciones extra por seguridad
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations() // ✅ habilita Angular Animations globalmente
  ]
}).catch((err) => console.error(err));
