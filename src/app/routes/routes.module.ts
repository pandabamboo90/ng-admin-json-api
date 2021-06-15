import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

// single pages
import { CallbackComponent } from './passport/callback.component';
import { UserLockComponent } from './passport/lock/lock.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { RouteRoutingModule } from './routes-routing.module';

const COMPONENTS: Type<void>[] = [
  // passport pages
  UserLoginComponent,
  // single pages
  CallbackComponent,
  UserLockComponent,
];

@NgModule({
  imports: [SharedModule, RouteRoutingModule],
  declarations: COMPONENTS,
})
export class RoutesModule {}
