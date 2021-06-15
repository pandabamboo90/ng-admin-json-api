import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GlobalFooterModule } from '@delon/abc/global-footer';
import { NoticeIconModule } from '@delon/abc/notice-icon';
import { LayoutDefaultModule } from '@delon/theme/layout-default';
import { SettingDrawerModule } from '@delon/theme/setting-drawer';
import { ThemeBtnModule } from '@delon/theme/theme-btn';
import { SharedModule } from '@shared';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { LayoutBasicComponent } from './basic/basic.component';
import { HeaderClearStorageComponent } from './basic/widgets/clear-storage.component';
import { HeaderFullScreenComponent } from './basic/widgets/fullscreen.component';
// passport
import { HeaderPermissionSettingComponent } from './basic/widgets/permission-setting.component';
import { HeaderSearchComponent } from './basic/widgets/search.component';
import { HeaderUserComponent } from './basic/widgets/user.component';
import { LayoutBlankComponent } from './blank/blank.component';
import { LayoutPassportComponent } from './passport/passport.component';

const COMPONENTS = [LayoutBasicComponent, LayoutBlankComponent];

const HEADERCOMPONENTS = [
  HeaderUserComponent,
  HeaderSearchComponent,
  HeaderFullScreenComponent,
  HeaderClearStorageComponent,
  HeaderPermissionSettingComponent,
];

const PASSPORT = [
  LayoutPassportComponent,
];

const MODULES = [
  CommonModule,
  FormsModule,
  RouterModule,
  ThemeBtnModule,
  SettingDrawerModule,
  LayoutDefaultModule,
  NoticeIconModule,
  GlobalFooterModule,
  NzDropDownModule,
  NzInputModule,
  NzAutocompleteModule,
  NzGridModule,
  NzFormModule,
  NzSpinModule,
  NzBadgeModule,
  NzAvatarModule,
  NzIconModule,
  NzTagModule,
  SharedModule,
];

@NgModule({
  imports: [...MODULES],
  declarations: [...COMPONENTS, ...HEADERCOMPONENTS, ...PASSPORT],
  exports: [...COMPONENTS, ...PASSPORT],
})
export class LayoutModule {}
