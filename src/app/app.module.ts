// tslint:disable: no-duplicate-imports
// register angular
import { registerLocaleData } from '@angular/common';
// #region Http Interceptors
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// #region default language
// Reference: https://ng-alain.com/docs/i18n
import { default as ngLang } from '@angular/common/locales/en';
import { APP_INITIALIZER, LOCALE_ID, NgModule, Provider, Type } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// #region Startup Service
import { CacheService, DefaultInterceptor, DeviseTokenAuthInterceptor, MenuService, StartupService } from '@core';
import { DelonAuthModule } from '@delon/auth';
import { CacheService as AlainCache } from '@delon/cache';
import { DELON_LOCALE, en_US as delonLang, MenuService as AlainMenu } from '@delon/theme';
import { environment } from '@env/environment';
// #region JSON Schema form (using @delon/form)
import { ADMIN_URL_TOKEN, CACHE_TOKEN, generateUrl, JsonSchemaModule, SharedModule } from '@shared';
import { zhCN as dateLang } from 'date-fns/locale';
import { en_US as zorroLang, NZ_DATE_LOCALE, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { GlobalConfigModule } from './global-config.module';
import { LayoutModule } from './layout/layout.module';
import { RoutesModule } from './routes/routes.module';
import { STWidgetModule } from './shared/st-widget/st-widget.module';

// #region lang providers
const LANG = {
  abbr: 'en',
  ng: ngLang,
  zorro: zorroLang,
  date: dateLang,
  delon: delonLang,
};
registerLocaleData(LANG.ng, LANG.abbr);
const LANG_PROVIDES: Provider[] = [
  { provide: LOCALE_ID, useValue: LANG.abbr },
  { provide: NZ_I18N, useValue: LANG.zorro },
  { provide: NZ_DATE_LOCALE, useValue: LANG.date },
  { provide: DELON_LOCALE, useValue: LANG.delon },
];
// #endregion

// #region interceptor providers
const INTERCEPTOR_PROVIDES: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: DeviseTokenAuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
];
// #endregion

// #region modules
const MODULES: Type<any>[] = [
  BrowserModule,
  BrowserAnimationsModule,
  HttpClientModule,
  CoreModule,
  SharedModule,
  LayoutModule,
  RoutesModule,
  STWidgetModule,
  NzMessageModule,
  NzNotificationModule,
  DelonAuthModule,
];
// #endregion

// #region global third module
const GLOBAL_THIRD_MODULES: Type<any>[] = [];
// #endregion

// #region form module
const FORM_MODULES = [JsonSchemaModule];
// #endregion

// #region app provider
const APPINIT_PROVIDES: Provider[] = [
  StartupService,
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [StartupService],
    multi: true,
  },
  {
    provide: MenuService,
    useExisting: AlainMenu,
  },
  { provide: CacheService, useExisting: AlainCache },
];
// #endregion

// #region token provider
const { services: { superAdminServiceUrl } = {} } = environment;
const TOKEN_PROVIDERS: Provider[] = [
  { provide: CACHE_TOKEN, useValue: '' },
  { provide: ADMIN_URL_TOKEN, useValue: generateUrl(`${ superAdminServiceUrl }/admin`) },
];

// #endregion

export function StartupServiceFactory(startupService: StartupService): () => Promise<void> {
  return () => startupService.load();
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    GlobalConfigModule.forRoot(),
    ...MODULES,
    ...GLOBAL_THIRD_MODULES,
    ...FORM_MODULES,
  ],
  providers: [
    ...LANG_PROVIDES,
    ...INTERCEPTOR_PROVIDES,
    ...APPINIT_PROVIDES,
    ...TOKEN_PROVIDERS,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
