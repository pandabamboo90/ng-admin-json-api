import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SFComponent, SFRadioWidgetSchema, SFSchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { first as _first, map as _map } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';

@UntilDestroy()
@Component({
  selector: 'app-user-user-send-money',
  templateUrl: './user-send-money.component.html',
})
export class UserUserSendMoneyComponent implements OnInit {

  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: number | string;
  title!: string;
  subTitle!: string;
  formData!: any;
  schema: SFSchema = {
    properties: {
      destination_wallet_id: {
        title: 'Destination Wallet ID',
        type: 'string',
      },
      amount: {
        title: 'Amount',
        type: 'number',
        default: 0
      },
      cash_type: {
        title: 'Cash Type',
        type: 'string',
        enum: [
          { label: 'CC', value: 'cc' },
          { label: 'KC', value: 'kc' },
          { label: 'LEC', value: 'lec' },
        ],
        ui: {
          widget: 'radio',
          styleType: 'button',
          buttonStyle: 'solid',
        } as SFRadioWidgetSchema,
        default: 'cc',
      },
    },
    required: ['amount', 'cash_type'],
  };

  constructor(
    private msgSrv: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    public http: _HttpClient,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.title = `Send money`;
    this.subTitle = `Send money to User ID: ${this.id}`;
    this.fetchUserById(this.id);
  }

  submit(value: any): void {
    this.http.post(`/admin/transactions/send_money`, value)
      .subscribe(res => {
        this.msgSrv.success('Money sent successfully !');
        this.router.navigateByUrl(`/user/list`);
      });
  }

  fetchUserById(id: number | string): void {
    this.http.get(`/admin/users/${id}`)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const walletList = _map(res.data.wallets, (item) => {
          return { label: `ID: ${item.id} - ${[res.data.first_name, res.data.last_name].join(' ')}` , value: item.id };
        });
        this.schema.properties!.destination_wallet_id.enum = walletList;
        this.schema.properties!.destination_wallet_id.default = _first(walletList)!.value;
        this.sf.refreshSchema();
      });
  }
}
