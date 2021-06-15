import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { TenantTenantEditComponent } from './tenant-edit/tenant-edit.component';
import { TenantTenantListComponent } from './tenant-list/tenant-list.component';
import { TenantRoutingModule } from './tenant-routing.module';

const COMPONENTS: Type<void>[] = [
  TenantTenantListComponent,
  TenantTenantEditComponent];

@NgModule({
  imports: [
    SharedModule,
    TenantRoutingModule
  ],
  declarations: COMPONENTS,
})
export class TenantModule { }
