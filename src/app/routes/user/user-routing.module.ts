import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserUserEditComponent } from './user-edit/user-edit.component';
import { UserUserListComponent } from './user-list/user-list.component';
import { UserUserSendMoneyComponent } from './user-send-money/user-send-money.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: UserUserListComponent },
  { path: ':id', component: UserUserEditComponent },
  { path: ':id/send-money', component: UserUserSendMoneyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
