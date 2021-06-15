import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { PermissionComponent } from './permission/permission.component';

const routes: Routes = [
  { path: '', redirectTo: 'permission', pathMatch: 'full' },
  { path: 'account', component: AccountComponent },
  { path: 'permission', component: PermissionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingRoutingModule {
}
