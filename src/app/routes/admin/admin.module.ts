import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AdminAdminEditComponent } from './admin-edit/admin-edit.component';
import { AdminAdminListComponent } from './admin-list/admin-list.component';
import { AdminRoutingModule } from './admin-routing.module';

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
