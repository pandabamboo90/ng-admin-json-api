import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, StartupService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ADMIN_URL_TOKEN,
  BaseList,
  catchError,
  Entity,
  FormError,
  IEndpoint,
  IMsgObject,
  ITenant,
  IUser,
  parseError,
  Tenant,
} from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@UntilDestroy()
@Component({
  selector: 'app-tenant-tenant-list',
  templateUrl: './tenant-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantTenantListComponent extends BaseList<ITenant> {
  @ViewChild('st') protected readonly st!: STComponent;
  columns: STColumn<ITenant>[] = [
    { title: '#', index: 'id' },
    { title: 'Display Name', index: 'display_name' },
    {
      title: '',
      buttons: [
        {
          text: '編集',
          icon: 'edit',
          click: (item) => this.router.navigateByUrl(`/tenant/${ item.id }`),
          iif: (item) => this.user.can('tenants_update'),
        },
        {
          text: '削除',
          className: 'text-red',
          icon: 'delete',
          type: 'del',
          pop: {
            title: 'Are you sure ?',
            okType: 'danger',
            icon: 'check-circle',
          },
          click: (record, _modal, comp) => {
            comp!.removeRow(record);
            this.deleteTenant(record?.id);
          },
          iif: (item) => this.user.can('tenants_destroy'),
        },
      ],
    },
  ];

  msgObj: IMsgObject = {
    msgSrv: this.messageSrv,
    notificationSrv: this.notificationSrv,
    show: (error: FormError<IUser>) => parseError(error),
  };

  constructor(
    @Inject(ADMIN_URL_TOKEN) protected urlEndpoint: IEndpoint<Entity>,
    protected router: Router,
    protected http: ApiService,
    protected cdRef: ChangeDetectorRef,
    protected startupSrv: StartupService,
    protected messageSrv: NzMessageService,
    protected notificationSrv: NzNotificationService,
  ) {
    super(urlEndpoint, router, http, cdRef, startupSrv);
  }

  protected get entity(): Entity {
    return 'tenant';
  }

  protected get modelInstance(): new (...args: any[]) => any | undefined {
    return Tenant;
  }

  protected onError(args: any): void {}

  protected onSuccess(...args: any[]): void {}

  deleteTenant(id: number | string): void {
    this.loading = true;
    this.http.delete(`${ this.urlEndpoint.tenants }/${ id }`)
      .pipe(
        catchError(this.msgObj, () => this.loading = false),
        untilDestroyed(this),
      )
      .subscribe(res => {
        this.loading = false;
        this.messageSrv.success('Deleted successfully !');
      });
  }
}
