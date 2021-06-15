import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, StartupService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ADMIN_URL_TOKEN, BaseList, Entity, IEndpoint, IResponse, IUser, User } from '@shared';

@UntilDestroy()
@Component({
  selector: 'app-admin-admin-list',
  styles: [
    `
      nz-tag:hover {
        background: #3654f433;
        cursor: pointer;
      }
    `,
  ],
  templateUrl: './admin-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdminListComponent extends BaseList<IUser> {
  @ViewChild('st') protected readonly st!: STComponent;
  columns: STColumn<IUser>[] = [
    { title: '#', index: 'id', width: 100 },
    { title: 'First Name', index: 'first_name', width: 200 },
    { title: 'Last Name', index: 'last_name', width: 200 },
    { title: 'Email', index: 'email', width: 200 },
    { title: 'KYC passed', index: 'kyc_passed', type: 'yn', width: 100 },
    { title: 'Wallet ID', render: 'wallets-cell-tpl', width: 300 },
    { title: 'Tenant', index: 'tenant.display_name', width: 100 },
    {
      title: '',
      buttons: [
        {
          text: 'Send money',
          icon: 'dollar-circle',
          click: (user) => this.router.navigateByUrl(`/user/${ user.id }/send-money`),
          iif: (user) => this.can(user, 'send_money'),
        },
        {
          text: 'Edit',
          icon: 'edit',
          click: (user) => this.router.navigateByUrl(`/admin/${ user.id }`),
          iif: (user) => this.can(user, 'update'),
        },
        // {
        //   text: 'Delete',
        //   className: 'text-red',
        //   icon: 'delete',
        //   type: 'del',
        //   pop: {
        //     title: 'Are you sure ?',
        //     okType: 'danger',
        //     icon: 'check-circle',
        //   },
        //   click: (user, _modal, comp) => comp!.removeRow(user),
        //   iif: (user) => this.can(user, 'destroy'),
        // },
      ],
      width: 350,
    },
  ];

  sortCols: (keyof IUser)[] = ['id', 'first_name', 'last_name', 'email'];

  constructor(
    @Inject(ADMIN_URL_TOKEN) protected urlEndpoint: IEndpoint<Entity>,
    protected router: Router,
    protected http: ApiService,
    protected cdRef: ChangeDetectorRef,
    protected startupSrv: StartupService,
  ) {
    super(urlEndpoint, router, http, cdRef, startupSrv);
  }

  protected get entity(): Entity {
    return 'admin';
  }

  protected get modelInstance(): new (...args: any[]) => any | undefined {
    return User;
  }

  protected onError(args: any): void {}

  protected onSuccess(...args: IResponse<IUser>[]): void {}
}
