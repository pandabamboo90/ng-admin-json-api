import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, StartupService } from '@core';
import { SFComponent, SFRadioWidgetSchema, SFSchema } from '@delon/form';
import { SFSchemaEnum } from '@delon/form/src/schema';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ADMIN_URL_TOKEN,
  catchError,
  Entity,
  FormError,
  ICurrency,
  IEndpoint,
  IMsgObject,
  IProfileObject,
  IUser,
  parseError,
  updateProfile,
  User,
} from '@shared';
import { first as _first, map as _map } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@UntilDestroy()
@Component({
  selector: 'app-user-user-send-money',
  templateUrl: './user-send-money.component.html',
})
export class UserUserSendMoneyComponent implements OnInit, AfterViewInit {
  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: number | string;

  title = `Send money`;
  subTitle!: string;

  schema: SFSchema = {
    properties: {
      destination_wallet_id: {
        title: 'Destination Wallet ID',
        type: 'string',
      },
      amount: {
        title: 'Amount',
        type: 'number',
        default: 0,
      },
      cash_type: {
        title: 'Cash Type',
        type: 'string',
        ui: {
          widget: 'radio',
          styleType: 'button',
          buttonStyle: 'solid',
        } as SFRadioWidgetSchema,
      },
    },
    required: ['amount', 'cash_type'],
  };
  formData!: any;

  msgObj: IMsgObject = {
    msgSrv: this.messageSrv,
    notificationSrv: this.notificationSrv,
    show: (error: FormError<IUser>) => parseError(error),
  };
  profileObj: IProfileObject = {
    http: this.http,
    startupSrv: this.startupSrv,
    msgObj: this.msgObj,
  };

  redirectTo = 'admin';

  constructor(
    @Inject(ADMIN_URL_TOKEN) protected urlEndpoint: IEndpoint<Entity>,
    private router: Router,
    private http: ApiService,
    private route: ActivatedRoute,
    private startupSrv: StartupService,
    private messageSrv: NzMessageService,
    private notificationSrv: NzNotificationService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params?.id;
    this.subTitle = `Send money to User ID: ${ this.id }`;
    this.fetchUserById(this.id);
  }

  ngAfterViewInit(): void {
    this.setCashTypes();
  }

  setCashTypes(): void {
    const currencyList = (this.startupSrv.getData('currency') as ICurrency[] || [])
      .map((
        {
          type_number,
          currency_code,
        },
      ) =>
        ({ label: currency_code.toUpperCase(), value: type_number }));

    this.schema.properties!.cash_type.enum = [...currencyList];
    this.schema.properties!.cash_type.default = _first(currencyList as SFSchemaEnum[])!.value;
    this.sf.refreshSchema();
  }

  fetchUserById(id: number | string): void {
    this.http.get(`${ this.urlEndpoint.users }/${ id }`, {}, { castTo: User })
      .pipe(untilDestroyed(this))
      .subscribe(({ data: user }: { data: User }) => {
        const walletList = _map(user.wallets, (item) => (
          {
            label: `ID: ${ item.id } - ${ [user.first_name, user.last_name].join(' ') }`,
            value: item.id,
          }
        ));
        this.schema.properties!.destination_wallet_id.enum = walletList;
        this.schema.properties!.destination_wallet_id.default = _first(walletList)!.value;
        this.sf.refreshSchema();
        this.redirectTo = user.role.toLowerCase();
      });
  }

  submit(data: any): void {
    this.http.post(`${ this.urlEndpoint.transactions }/send_money`, data)
      .pipe(
        catchError(this.msgObj),
        updateProfile(this.profileObj),
        untilDestroyed(this),
      )
      .subscribe(res => {
        this.messageSrv.success('Money sent successfully !');
        this.router.navigateByUrl(`/${ this.redirectTo }/list`).then();
      });
  }
}
