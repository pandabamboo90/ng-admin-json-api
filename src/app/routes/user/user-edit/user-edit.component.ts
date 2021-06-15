import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@core';
import { SFComponent, SFRadioWidgetSchema, SFSchema, SFUISchemaItem } from '@delon/form';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ADMIN_URL_TOKEN,
  catchError,
  Entity,
  FormError,
  IEndpoint,
  IMsgObject,
  IResponse,
  IUser,
  parseError,
} from '@shared';
import { omit as _omit } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@UntilDestroy()
@Component({
  selector: 'app-user-user-edit',
  templateUrl: './user-edit.component.html',
})
export class UserUserEditComponent implements OnInit {
  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: number | string;

  title!: string;
  subTitle!: string;

  formData!: any;

  schema: SFSchema = {
    properties: {
      first_name: {
        title: 'First name',
        type: 'string',
      },
      last_name: {
        title: 'Last name',
        type: 'string',
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
          type: 'password'
        }
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
        default: 'yes',
      },
    },
    required: ['first_name', 'last_name', 'email', 'cellphone', 'password', 'must_kyc'],
  };

  msgObj: IMsgObject = {
    msgSrv: this.msgSrv,
    notificationSrv: this.notificationSrv,
    show: (error: FormError<IUser>) => parseError(error),
  };

  constructor(
    @Inject(ADMIN_URL_TOKEN) protected urlEndpoint: IEndpoint<Entity>,
    private router: Router,
    private http: ApiService,
    private route: ActivatedRoute,
    private msgSrv: NzMessageService,
    private notificationSrv: NzNotificationService,
  ) {}

  get isCreate(): boolean {
    return this.id === 'new';
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params?.id;

    if (this.isCreate) {
      this.title = 'New User';
      this.schema.properties = _omit(this.schema.properties, ['authy_id']);
    } else {
      this.fetchUserById<IResponse<IUser>>(this.id);
    }
  }

  fetchUserById<T extends IResponse<IUser>>(id: number | string): void {
    this.title = `Edit User`;
    this.subTitle = `ID: ${ this.id }`;
    this.http.get(`${ this.urlEndpoint.users }/${ id }`)
      .pipe(untilDestroyed(this))
      .subscribe((res: T) => {
        this.formData = res?.data;
        this.schema.properties!.email.readOnly = true;

        const passwordUi: SFUISchemaItem = this.schema.properties!.password.ui as SFUISchemaItem;
        passwordUi.hidden = true;
        this.sf.refreshSchema();
      });
  }

  createUser<T, R>(data: T): void {
    this.http.post<R>(`${ this.urlEndpoint.users }`, { data })
      .pipe(
        catchError(this.msgObj),
        untilDestroyed(this),
      )
      .subscribe(async res => {
        this.msgSrv.success('Created successfully !');
        await this.router.navigateByUrl(`/user/list`);
      });
  }

  updateUser<T, R>(data: T): void {
    this.http.put<R>(`${ this.urlEndpoint.users }/${ this.id }`, { data })
      .pipe(
        catchError(this.msgObj),
        untilDestroyed(this),
      )
      .subscribe(async res => {
        this.msgSrv.success('Updated successfully !');
        await this.router.navigateByUrl(`/user/list`);
      });
  }

  do<T>(createOrUpdate: 'true' | 'false'): (...args: T[]) => void {
    const action = {
      true: this.createUser.bind(this),
      false: this.updateUser.bind(this),
    };
    return action[createOrUpdate];
  }

  submit(value: Partial<IUser>): void {
    const isFormValid = this.sf.validator({ emitError: true });
    if (isFormValid) {
      const createOrUpdate = this.isCreate + '' as 'true' | 'false';
      this.do(createOrUpdate)(value);
    }
  }
}
