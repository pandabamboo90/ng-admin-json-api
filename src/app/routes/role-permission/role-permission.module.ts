import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { RolePermissionRoutingModule } from './role-permission-routing.module';
import { RolePermissionEditComponent } from './role-permission-edit/role-permission-edit.component';

const COMPONENTS: Type<void>[] = [
  RolePermissionEditComponent];

@NgModule({
  imports: [
    SharedModule,
    RolePermissionRoutingModule,
  ],
  declarations: COMPONENTS,
})
export class RolePermissionModule { }
