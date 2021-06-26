import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRoutingModule } from './user-routing.module';

const COMPONENTS: Type<void>[] = [
  UserListComponent,
  UserEditComponent,
];

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule,
  ],
  declarations: COMPONENTS,
})
export class UserModule { }
