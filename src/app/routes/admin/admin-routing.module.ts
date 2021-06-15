import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAdminEditComponent } from './admin-edit/admin-edit.component';
import { AdminAdminListComponent } from './admin-list/admin-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: AdminAdminListComponent },
  { path: ':id', component: AdminAdminEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
