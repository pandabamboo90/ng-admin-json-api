import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { TicketRoutingModule } from './ticket-routing.module';
import { TicketTicketListComponent } from './ticket-list/ticket-list.component';
import { TicketTicketEditComponent } from './ticket-edit/ticket-edit.component';

const COMPONENTS: Type<void>[] = [
  TicketTicketListComponent,
  TicketTicketEditComponent];

@NgModule({
  imports: [
    SharedModule,
    TicketRoutingModule
  ],
  declarations: COMPONENTS,
})
export class TicketModule { }
