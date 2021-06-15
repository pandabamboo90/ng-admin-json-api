import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpleGuard } from '@delon/auth';
import { environment } from '@env/environment';
// layout
import { LayoutBasicComponent } from '../layout/basic/basic.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';
// single pages
import { CallbackComponent } from './passport/callback.component';
import { UserLockComponent } from './passport/lock/lock.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [SimpleGuard],
    children: [
      { path: '', redirectTo: 'admin', pathMatch: 'full' },
      { path: 'exception', loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule) },
      { path: 'admin', loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule) },
      { path: 'user', loadChildren: () => import('./user/user.module').then((m) => m.UserModule) },
    ],
  },
  // 空白布局
  // {
  //     path: 'blank',
  //     component: LayoutBlankComponent,
  //     children: [
  //     ]
  // },
  // passport
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      { path: 'login', component: UserLoginComponent },
      { path: 'lock', component: UserLockComponent },
    ],
  },
  // 单页不包裹Layout
  { path: 'passport/callback/:type', component: CallbackComponent },
  { path: '**', redirectTo: 'exception/404' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes, {
        useHash: environment.useHash,
        // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
        // Pls refer to https://ng-alain.com/components/reuse-tab
        scrollPositionRestoration: 'top',
      },
    )],
  exports: [RouterModule],
})
export class RouteRoutingModule {
}
