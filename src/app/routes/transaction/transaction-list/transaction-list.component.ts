import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, CacheService, StartupService } from '@core';
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
  IProfileObject,
  IResponse,
  ITransaction,
  IUser,
  parseError,
  Transaction,
  TransactionStatus,
  updateProfile,
} from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-transaction-transaction-list',
  templateUrl: './transaction-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionTransactionListComponent extends BaseList<ITransaction> {
  @ViewChild('st') protected readonly st!: STComponent;
  columns: STColumn<ITransaction>[] = [
    { title: '#', index: 'id' },
    { title: 'Sender', index: 'sender_user.full_name' },
    { title: 'Receiver', index: 'receiver_user.full_name' },
    { title: 'Amount', index: 'amount' },
    {
      title: 'Cash Type', index: 'cash_type', type: 'tag',
    },
    {
      title: 'Status', index: 'status', type: 'tag',
      tag: {
        pending: { text: TransactionStatus.pending, color: 'orange' },
        done: { text: TransactionStatus.done, color: 'green' },
      },
    },
    {
      title: '',
      buttons: [
        {
          text: 'Receive',
          icon: 'check',
          className: 'text-green',
          click: (record, _modal, comp) => {
            this.receiveCash(record.id)
              .subscribe((res) => {
                this.loading = false;
                comp?.setRow(record, { status: 'done' });
                this.messageSrv.success('Transaction approved !');
                this.cdRef.markForCheck();
              });
          },
          iif: (item) => this.can(item, 'receive', () => item.status === 'pending'),
        },
      ],
    },
  ];

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

  constructor(
    @Inject(ADMIN_URL_TOKEN) protected urlEndpoint: IEndpoint<Entity>,
    protected router: Router,
    protected http: ApiService,
    protected cdRef: ChangeDetectorRef,
    protected startupSrv: StartupService,
    protected messageSrv: NzMessageService,
    protected cacheSrv: CacheService<ITransaction>,
    protected notificationSrv: NzNotificationService,
  ) {
    super(urlEndpoint, router, http, cdRef, startupSrv);
  }

  protected get entity(): Entity {
    return 'transaction';
  }

  protected get modelInstance(): new (...args: any[]) => any {
    return Transaction;
  }

  protected onError(...args: any[]): void {}

  protected onSuccess(...args: any[]): void {}

  updatedTransactionList(transId: string | number = ''): IResponse<ITransaction> {
    if (!this.cacheSrv.getNone<IResponse<ITransaction>>('transactions')) {
      return { data: [], meta: { page: 1, per_page: 10, total: 0 } };
    }

    const { data, meta } = this.cacheSrv.getNone<IResponse<ITransaction>>('transactions');

    for (const transaction of data) {
      if (transaction?.id === transId) {
        transaction.status = 'done';
      }
    }

    return { data, meta };
  }

  receiveCash(id: string | number): Observable<unknown> {
    this.loading = true;
    return this.http.post<IResponse<ITransaction>>(`${ this.urlEndpoint?.transactions }/${ id }/receive_money`)
      .pipe(
        catchError(this.msgObj, () => this.loading = false),
        updateProfile(this.profileObj),
        untilDestroyed(this),
      );
  }
}
