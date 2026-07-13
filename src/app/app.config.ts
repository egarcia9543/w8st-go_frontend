import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './infrastructure/interceptors/credentials-interceptor';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { AuthRepository } from './domain/repositories/auth/auth.repository';
import { AuthRepositoryImp } from './infrastructure/repositories/auth/auth.repository.imp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([credentialsInterceptor])),
    provideSpartanHlm(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'es',
      lang: 'es',
    }),
    provideLottieOptions({ player: () => player }),
    { provide: AuthRepository, useClass: AuthRepositoryImp },
  ],
};
