import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlainThemeModule } from '@delon/theme';
import { ScrollDirective } from '@src/app/shared/directives';
import { NamePipe } from '@src/app/shared/pipes';
import { UserWalletComponent } from './components/user-wallet/user-wallet.component';
import { WalletIdComponent } from './components/wallet-id/wallet-id.component';

import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';

// #region third libs
const THIRDMODULES: Type<any>[] = [];
// #endregion

// #region modules
const MODULES: Type<any>[] = [
  CommonModule,
  FormsModule,
  RouterModule,
  ReactiveFormsModule,
  ...SHARED_DELON_MODULES,
  ...SHARED_ZORRO_MODULES,
  // third libs
  ...THIRDMODULES,
];
// #endregion

// #region your components & directives
const COMPONENTS: Type<any>[] = [UserWalletComponent, WalletIdComponent];
const DIRECTIVES: Type<any>[] = [ScrollDirective];
const PIPES: Type<any>[] = [NamePipe];
// #endregion

@NgModule({
  imports: [
    AlainThemeModule.forChild(),
    ...MODULES,
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    // your directives
    ...DIRECTIVES,
    // your pipes
    ...PIPES,
  ],
  exports: [
    AlainThemeModule,
    ...MODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
  ],
})
export class SharedModule {}
