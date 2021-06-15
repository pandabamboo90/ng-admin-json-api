import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketTicketEditComponent } from './ticket-edit/ticket-edit.component';
import { TicketTicketListComponent } from './ticket-list/ticket-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: TicketTicketListComponent },
  { path: ':id', component: TicketTicketEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
