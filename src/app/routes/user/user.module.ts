import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { UserUserEditComponent } from './user-edit/user-edit.component';
import { UserUserListComponent } from './user-list/user-list.component';
import { UserRoutingModule } from './user-routing.module';
import { UserUserSendMoneyComponent } from './user-send-money/user-send-money.component';

const COMPONENTS: Type<void>[] = [
  UserUserListComponent,
  UserUserEditComponent,
  UserUserSendMoneyComponent,
];

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule,
    NzTagModule,
  ],
  declarations: COMPONENTS,
})
export class UserModule { }
