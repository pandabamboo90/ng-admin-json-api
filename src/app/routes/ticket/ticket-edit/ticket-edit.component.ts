import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, StartupService } from '@core';
import { SFComponent, SFRadioWidgetSchema, SFSchema } from '@delon/form';
import { SFSchemaEnum } from '@delon/form/src/schema';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ADMIN_URL_TOKEN, Entity, FormError, ICurrency, IEndpoint, IMsgObject, IUser, parseError } from '@shared';
import { first as _first } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@UntilDestroy()
@Component({
  selector: 'app-ticket-ticket-edit',
  templateUrl: './ticket-edit.component.html',
})
export class TicketTicketEditComponent implements OnInit, AfterViewInit {
  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: number | string;

  title!: string;
  subTitle!: string;

  formData!: any;
  schema: SFSchema = {
    properties: {
      message: {
        title: 'Message',
        type: 'string',
      },
      amount: {
        title: 'Amount',
        type: 'number',
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

  msgObj: IMsgObject = {
    msgSrv: this.messageSrv,
    notificationSrv: this.notificationSrv,
    show: (error: FormError<IUser>) => parseError(error),
  };

  constructor(
    @Inject(ADMIN_URL_TOKEN) protected urlEndpoint: IEndpoint<Entity>,
    private router: Router,
    private http: ApiService,
    private route: ActivatedRoute,
    private msgSrv: NzMessageService,
    private startupSrv: StartupService,
    private messageSrv: NzMessageService,
    private notificationSrv: NzNotificationService,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params?.id;
    if (this.id === 'new') {
      this.title = 'New Ticket';
    }
  }

  ngAfterViewInit(): void {
    this.setCashTypes();
  }

  setCashTypes(): void {
    const currencyList = (this.startupSrv.getData('currency') as ICurrency[]).map(({ type_number, currency_code }) =>
      ({ label: currency_code.toUpperCase(), value: type_number }));
    this.schema.properties!.cash_type.enum = [...currencyList];
    this.schema.properties!.cash_type.default = _first(currencyList as SFSchemaEnum[])!.value;
    this.sf.refreshSchema();
  }

  submit(data: any): void {
    if (this.id === 'new') {
      this.http.post(`${ this.urlEndpoint.tickets }`, { data })
        .pipe(untilDestroyed(this))
        .subscribe(res => {
          this.msgSrv.success('Created successfully !');
          this.router.navigateByUrl(`/ticket/list`).then();
        });
    }
  }
}
