import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { AccountSettingsProfileComponent } from './settings/profile/profile.component';
import { AccountSettingsPasswordComponent } from './settings/password/password.component';
import { AccountSettingsComponent } from './settings/settings.component';
import { AccountRoutingModule } from './account-routing.module';

const COMPONENTS: Type<void>[] = [
  AccountSettingsComponent,
  AccountSettingsProfileComponent,
  AccountSettingsPasswordComponent,
];

@NgModule({
  imports: [
    SharedModule,
    AccountRoutingModule,
  ],
  declarations: COMPONENTS,
})
export class AccountModule {
}
