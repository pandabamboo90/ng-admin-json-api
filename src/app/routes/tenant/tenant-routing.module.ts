import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantTenantEditComponent } from './tenant-edit/tenant-edit.component';
import { TenantTenantListComponent } from './tenant-list/tenant-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: TenantTenantListComponent },
  { path: ':id', component: TenantTenantEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantRoutingModule { }
