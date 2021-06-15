import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpleGuard } from '@delon/auth';
import { environment } from '@env/environment';
import { UserInput2FATokenComponent } from 'src/app/routes/passport/input-2fa-token/input-2fa-token.component';
// layout
import { LayoutBasicComponent } from '../layout/basic/basic.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';
// single pages
import { CallbackComponent } from './passport/callback.component';
import { UserLockComponent } from './passport/lock/lock.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
import { UserRegisterComponent } from './passport/register/register.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [SimpleGuard],
    children: [
      { path: '', redirectTo: 'admin', pathMatch: 'full' },
      { path: 'exception', loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule) },
      { path: 'admin', loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule) },
      { path: 'tenant', loadChildren: () => import('./tenant/tenant.module').then((m) => m.TenantModule) },
      { path: 'user', loadChildren: () => import('./user/user.module').then((m) => m.UserModule) },
      { path: 'ticket', loadChildren: () => import('./ticket/ticket.module').then((m) => m.TicketModule) },
      {
        path: 'transaction',
        loadChildren: () => import('./transaction/transaction.module').then((m) => m.TransactionModule),
      },
      {
        path: 'setting', loadChildren: () => import('./settings/setting.module').then(m => m.SettingModule),
      },
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
      { path: 'login', component: UserLoginComponent, },
      { path: 'input-2fa-token', component: UserInput2FATokenComponent, },
      { path: 'register', component: UserRegisterComponent, },
      { path: 'register-result', component: UserRegisterResultComponent, },
      { path: 'lock', component: UserLockComponent, },
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
