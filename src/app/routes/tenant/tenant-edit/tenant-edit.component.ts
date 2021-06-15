import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, StartupService } from '@core';
import { SFComponent, SFSchema } from '@delon/form';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ADMIN_URL_TOKEN,
  catchError,
  Entity,
  FormError,
  IEndpoint,
  IMsgObject,
  IProfileObject,
  IUser,
  parseError,
  updateCurrencies,
  updateProfile,
} from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@UntilDestroy()
@Component({
  selector: 'app-tenant-tenant-edit',
  templateUrl: './tenant-edit.component.html',
})
export class TenantTenantEditComponent implements OnInit {
  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: number | string;
  title!: string;
  subTitle!: string;
  formData!: any;
  schema: SFSchema = {
    properties: {
      display_name: {
        title: 'Display Name',
        type: 'string',
      },
      currency_attributes: {
        type: 'object',
        properties: {
          type_title: {
            title: 'Cash name',
            type: 'string',
          },
          currency_code: {
            title: 'Cash type',
            type: 'string',
          },
        },
        required: ['type_title', 'currency_code'],
      },
    },
    required: ['display_name'],
  };

  msgObj: IMsgObject = {
    msgSrv: this.msgSrv,
    notificationSrv: this.notificationSrv,
    show: (error: FormError<IUser>) => parseError(error),
  };
  profileObj: IProfileObject = {
    http: this.http,
    startupSrv: this.startupSrv,
    msgObj: this.msgObj,
  };

  constructor(
    @Inject(ADMIN_URL_TOKEN) protected urlEndpoint: IEndpoint<Entity>,
    private router: Router,
    private http: ApiService,
    private route: ActivatedRoute,
    private msgSrv: NzMessageService,
    protected startupSrv: StartupService,
    protected notificationSrv: NzNotificationService,
  ) {}

  get isCreate(): boolean {
    return this.id === 'new';
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params?.id;

    if (this.id === 'new') {
      this.title = 'New Tenant';
    } else {
      this.title = `Edit Tenant`;
      this.subTitle = `ID: ${ this.id }`;
      this.fetchTenantById(this.id);
    }
  }

  fetchTenantById(id: number | string): void {
    this.http.get(`${ this.urlEndpoint.tenants }/${ id }`)
      .pipe(
        catchError(this.msgObj),
        untilDestroyed(this),
      )
      .subscribe(res => {
        this.formData = res.data;
        this.schema.properties!.currency_attributes.default = this.formData.currency;
        this.sf.refreshSchema();
      });
  }

  createTenant(data: any): void {
    this.http.post(`${ this.urlEndpoint?.tenants }`, { data })
      .pipe(
        catchError(this.msgObj),
        updateProfile(this.profileObj, true),
        untilDestroyed(this),
      )
      .subscribe(res => {
        this.msgSrv.success('Created successfully !');
        this.router.navigateByUrl('/tenant/list').then();
      });
  }

  updateTenant(data: any): void {
    this.http.put(`${ this.urlEndpoint?.tenants }/${ this.id }`, { data })
      .pipe(
        catchError(this.msgObj),
        updateProfile(this.profileObj, true),
        untilDestroyed(this),
      )
      .subscribe(res => {
        this.msgSrv.success('Updated successfully !');
        this.router.navigateByUrl('/tenant/list').then();
      });
  }

  submit(data: any): void {
    this.isCreate ? this.createTenant(data) : this.updateTenant(data);
  }
}
