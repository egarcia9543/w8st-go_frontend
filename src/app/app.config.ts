import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
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
import { AuthFacade } from './presentation/facades/auth.facade';
import { authInterceptor } from './presentation/interceptors/auth-interceptor';
import { TransactionsRepository } from './domain/repositories/transactions/transactions.repository';
import { TransactionRepositoryImp } from './infrastructure/repositories/transactions/transaction.repository.imp';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([credentialsInterceptor, authInterceptor])),
    provideSpartanHlm(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'es',
      lang: 'es',
    }),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideLottieOptions({ player: () => player }),
    provideAppInitializer(() => inject(AuthFacade).checkSession()),
    { provide: AuthRepository, useClass: AuthRepositoryImp },
    { provide: TransactionsRepository, useClass: TransactionRepositoryImp },
  ],
};
