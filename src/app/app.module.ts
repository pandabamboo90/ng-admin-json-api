// tslint:disable: no-duplicate-imports
import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { default as ngLang } from '@angular/common/locales/zh';
import { APP_INITIALIZER, LOCALE_ID, NgModule, Type } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AdminApi,
  DefaultInterceptor,
  DeviseTokenAuthInterceptor,
  RoleApi,
  StartupService,
  UserApi,
  PermissionApi,
  RolePermissionApi,
} from '@core';
import { DelonAuthModule } from '@delon/auth';
import { DELON_LOCALE, en_US as delonLang } from '@delon/theme';
import { JsonSchemaModule, SharedModule } from '@shared';
import { NgxJsonapiRegisterService } from '@src/app/core/http/ngx-jsonapi-register.service';
import { zhCN as dateLang } from 'date-fns/locale';
import { en_US as zorroLang, NZ_DATE_LOCALE, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NgxJsonapiModule } from 'ngx-jsonapi';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { GlobalConfigModule } from './global-config.module';
import { LayoutModule } from './layout/layout.module';
import { RoutesModule } from './routes/routes.module';

const LANG = {
  abbr: 'en',
  ng: ngLang,
  zorro: zorroLang,
  date: dateLang,
  delon: delonLang,
};
registerLocaleData(LANG.ng, LANG.abbr);
const LANG_PROVIDES = [
  { provide: LOCALE_ID, useValue: LANG.abbr },
  { provide: NZ_I18N, useValue: LANG.zorro },
  { provide: NZ_DATE_LOCALE, useValue: LANG.date },
  { provide: DELON_LOCALE, useValue: LANG.delon },
];
const INTERCEPTOR_PROVIDES = [
  { provide: HTTP_INTERCEPTORS, useClass: DeviseTokenAuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
];
const GLOBAL_THIRD_MODULES: Type<any>[] = [];
const FORM_MODULES = [JsonSchemaModule];

export function StartupServiceFactory(startupService: StartupService): () => Promise<void> {
  return () => startupService.load();
}

const APP_INIT_PROVIDES = [
  StartupService,
  { provide: APP_INITIALIZER, useFactory: StartupServiceFactory, deps: [StartupService], multi: true },
];

const JSON_API_PROVIDES = [
  NgxJsonapiRegisterService,
  UserApi, AdminApi, RoleApi, PermissionApi, RolePermissionApi
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    NgxJsonapiModule.forRoot({ url: '' }),
    BrowserModule,
    BrowserAnimationsModule,
    GlobalConfigModule.forRoot(),
    CoreModule,
    SharedModule,
    LayoutModule,
    RoutesModule,
    DelonAuthModule,
    ...GLOBAL_THIRD_MODULES,
    ...FORM_MODULES,
  ],
  providers: [
    ...LANG_PROVIDES,
    ...INTERCEPTOR_PROVIDES,
    ...APP_INIT_PROVIDES,
    ...JSON_API_PROVIDES,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
