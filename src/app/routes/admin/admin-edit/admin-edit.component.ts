import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StartupService } from '@core';
import { SFComponent, SFRadioWidgetSchema, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ADMIN_URL_TOKEN,
  catchError,
  Entity,
  FormError,
  IEndpoint,
  IMsgObject,
  IProfileObject,
  IResponse,
  ITenant,
  IUser,
  updateProfile,
} from '@shared';
import { ApiService } from '@src/app/core/services/api.service';
import { parseError } from '@src/app/shared/utils/helpers';
import { first as _first, map as _map, omit as _omit, without as _without } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { from } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-admin-admin-edit',
  templateUrl: './admin-edit.component.html',
})
export class AdminAdminEditComponent implements OnInit {
  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: number | string;

  title!: string;
  subTitle!: string;

  formData!: any;

  schema: SFSchema = {
    properties: {
      tenant_id: {
        type: 'string',
        title: 'Tenant',
      },
      first_name: {
        type: 'string',
        title: 'First name',
      },
      last_name: {
        type: 'string',
        title: 'Last name',
      },
      email: {
        type: 'string',
        title: 'Email',
        // format: 'email',
      },
      password: {
        type: 'string',
        title: 'Password',
        ui: {
          type: 'password',
        },
      },
      country_code: {
        type: 'string',
        title: 'Country code',
      },
      cellphone: {
        type: 'string',
        title: 'Phone number',
      },
      authy_id: {
        type: 'string',
        title: 'Authy ID',
        readOnly: true,
      },
      must_kyc: {
        type: 'string',
        title: 'Require 2FA',
        enum: [
          { label: 'yes', value: true },
          { label: 'no', value: false },
        ],
        ui: {
          widget: 'radio',
        } as SFRadioWidgetSchema,
        default: 'no',
      },
      role_ids: {
        type: 'number',
        title: 'Roles',
        enum: [
          { label: 'Wallet Admin', value: 1 },
          { label: 'Tenant Admin', value: 2 },
          { label: 'Client', value: 3 },
        ],
        ui: {
          widget: 'select',
          mode: 'tags',
        } as SFSelectWidgetSchema,
        default: null,
      },
    },
    required: ['first_name', 'last_name', 'email', 'password', 'must_kyc'],
  };
  readOnlyFields: (keyof IUser | string)[] = ['tenant_id', 'email'];

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
    private startupSrv: StartupService,
    private notificationSrv: NzNotificationService,
  ) {}

  get isCreate(): boolean {
    return this.id === 'new';
  }

  get shouldUpdateProfile(): boolean {
    return this.startupSrv.isYou(+this.id);
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params?.id;
    this.isCreate ? this.fetchTenantList() : this.fetchAdminById(this.id);
  }

  fetchTenantList(): void {
    this.title = 'New Admin';
    this.schema.properties = _omit(this.schema.properties, ['authy_id']);
    this.http
      .get<IResponse<ITenant>>(`${ this.urlEndpoint?.tenants }`)
      .pipe(untilDestroyed(this))
      .subscribe(({ data }) => this.setSchemaList(data));
  }

  fetchAdminById(id: number | string): void {
    this.title = `Edit Admin`;
    this.subTitle = `ID: ${ this.id }`;
    this.http
      .get<{ data: IUser }>(`${ this.urlEndpoint?.detail }/${ id }`)
      .pipe(untilDestroyed(this))
      .subscribe(({ data }) => this.setSchemaAdmin(data));
  }

  setSchemaList(data: ITenant[]): void {
    const tenantList = _map(data, (item) => ({ label: item.display_name, value: item.id }));
    this.schema.properties!.tenant_id.enum = tenantList;
    this.schema.properties!.tenant_id.default = _first(tenantList)!.value;
    this.sf.refreshSchema();
  }

  setSchemaAdmin(data: IUser): void {
    this.formData = { ...data };
    this.schema.properties!.role_ids.default = data.roles.map(role => role.id);
    for (const field of this.readOnlyFields) {
      if (field.includes('.')) {
        const [main, sub] = field.split('.');
        this.schema.properties![main].properties![sub].readOnly = true;
      } else {
        this.schema.properties![field].readOnly = true;
      }
    }
    this.schema.properties!.tenant_id.enum = [
      {
        label: data?.tenant?.display_name,
        value: data?.tenant_id,
      },
    ];
    this.schema.required = _without(this.schema.required, 'password');
    this.sf.refreshSchema();
  }

  createAdmin<T, R extends IResponse<T>>(data: T): void {
    this.http
      .post<R>(`${ this.urlEndpoint?.detail }`, { data })
      .pipe(catchError(this.msgObj), untilDestroyed(this))
      .subscribe((res) => this.redirectWithMessage('Created successfully !'));
  }

  updateAdmin<T, R extends IResponse<T>>(data: T): void {
    this.http
      .put<R>(`${ this.urlEndpoint?.detail }/${ this.id }`, { data })
      .pipe(
        catchError(this.msgObj),
        (this.shouldUpdateProfile ? updateProfile(this.profileObj) : from),
        untilDestroyed(this),
      )
      .subscribe(res => this.redirectWithMessage('Updated successfully !'));
  }

  redirectWithMessage(msg: string = '', url: string | undefined = '/admin/list'): void {
    this.msgSrv.success(msg);
    this.router.navigateByUrl(url ?? '').then();
  }

  submit(value: Partial<IUser>): void {
    const isFormValid = this.sf.validator({ emitError: true });
    if (isFormValid) {
      this.isCreate
        ? this.createAdmin<Partial<IUser>, IResponse<Partial<IUser>>>(value)
        : this.updateAdmin<Partial<IUser>, IResponse<Partial<IUser>>>(value);
    }
  }
}
