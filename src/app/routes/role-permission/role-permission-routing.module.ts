import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolePermissionEditComponent } from './role-permission-edit/role-permission-edit.component';

const routes: Routes = [
  { path: '', redirectTo: 'edit', pathMatch: 'full' },
  { path: 'edit', component: RolePermissionEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolePermissionRoutingModule { }
