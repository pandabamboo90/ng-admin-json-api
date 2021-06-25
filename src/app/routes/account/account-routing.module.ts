import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSettingsProfileComponent } from './settings/profile/profile.component';
import { AccountSettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: 'settings',
    component: AccountSettingsComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        component: AccountSettingsProfileComponent,
        data: { titleI18n: 'pro-account-settings' },
      },
      // {
      //   path: 'security',
      //   component: AccountSettingsSecurityComponent,
      //   data: { titleI18n: 'pro-account-settings' },
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {
}
