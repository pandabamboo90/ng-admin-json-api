import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { UserUserEditComponent } from './user-edit/user-edit.component';
import { UserUserListComponent } from './user-list/user-list.component';
import { UserRoutingModule } from './user-routing.module';

const COMPONENTS: Type<void>[] = [
  UserUserListComponent,
  UserUserEditComponent,
];

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule,
  ],
  declarations: COMPONENTS,
})
export class UserModule { }
