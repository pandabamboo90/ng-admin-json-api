import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NamePipe } from '@src/app/shared/pipes';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { AccountComponent } from './account/account.component';
import { PermissionComponent } from './permission/permission.component';
import { SettingRoutingModule } from './setting-routing.module';

const COMPONENTS: Type<any>[] = [PermissionComponent, AccountComponent];

const PIPES: Type<any>[] = [];

const MODULES: Type<any>[] = [
  SharedModule,
  CommonModule,
  SettingRoutingModule,
  NzSwitchModule,
  NzSliderModule,
  NzUploadModule,
];

@NgModule({
  imports: [...MODULES],
  declarations: [...COMPONENTS, ...PIPES],
  providers: [NamePipe],
})
export class SettingModule {
}
