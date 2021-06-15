import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailGuard } from '@src/app/core/guards/detail.guard';
import { AdminAdminEditComponent } from './admin-edit/admin-edit.component';
import { AdminAdminListComponent } from './admin-list/admin-list.component';

const routes: Routes = [
  {
    path: 'list',
    component: AdminAdminListComponent,
  },
  {
    path: ':id',
    canActivate: [DetailGuard],
    component: AdminAdminEditComponent,
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
