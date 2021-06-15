import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminAdminListComponent } from './admin-list/admin-list.component';
import { AdminAdminEditComponent } from './admin-edit/admin-edit.component';

const COMPONENTS: Type<void>[] = [
  AdminAdminListComponent,
  AdminAdminEditComponent];

@NgModule({
  imports: [
    SharedModule,
    AdminRoutingModule,
    NzTagModule,
  ],
  declarations: COMPONENTS,
})
export class AdminModule { }
