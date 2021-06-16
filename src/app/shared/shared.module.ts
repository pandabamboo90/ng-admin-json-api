import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';
import { AlainThemeModule } from '@delon/theme';


import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';

const ANGULAR_MODULES = [
  CommonModule,
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
];

const DELON_MODULES = [
  DelonACLModule,
  DelonFormModule,
];

// #region third libs
const EXTERNAL_MODULES: Type<any>[] = [];
// #endregion

// #region your components & directives
const COMPONENTS: Type<any>[] = [];
const DIRECTIVES: Type<any>[] = [];

// #endregion

@NgModule({
  imports: [
    ...ANGULAR_MODULES,
    ...DELON_MODULES,
    AlainThemeModule.forChild(),
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // External 3rd parties libs
    ...EXTERNAL_MODULES,
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
  exports: [
    ...ANGULAR_MODULES,
    ...DELON_MODULES,
    AlainThemeModule,
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // External 3rd parties libs
    ...EXTERNAL_MODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
  ],
})
export class SharedModule {
}
