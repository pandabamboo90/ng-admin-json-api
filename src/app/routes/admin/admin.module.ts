import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminEditComponent } from './admin-edit/admin-edit.component';

const COMPONENTS: Type<void>[] = [
  AdminListComponent,
  AdminEditComponent];

@NgModule({
  imports: [
    SharedModule,
    AdminRoutingModule,
    NzTagModule,
  ],
  declarations: COMPONENTS,
})
export class AdminModule { }
