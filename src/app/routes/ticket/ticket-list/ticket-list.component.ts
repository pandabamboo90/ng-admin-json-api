import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
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
  ITicket,
  IUser,
  parseError,
  Ticket,
  TicketStatus,
} from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-ticket-ticket-list',
  templateUrl: './ticket-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTicketListComponent extends BaseList<ITicket> implements AfterViewInit {
  @ViewChild('st') protected readonly st!: STComponent;
  columns: STColumn<ITicket>[] = [
    { title: '#', index: 'id' },
    { title: 'Requested By', index: 'requested_by' },
    { title: 'Tenant', index: 'tenant_name' },
    { title: 'Amount', index: 'amount' },
    {
      title: 'Cash Type', index: 'cash_type', type: 'tag',
    },
    { title: 'Message', index: 'message' },
    {
      title: 'Status', index: 'status', type: 'tag',
      tag: {
        pending: { text: TicketStatus.pending, color: 'orange' },
        approved: { text: TicketStatus.approved, color: 'green' },
        rejected: { text: TicketStatus.rejected, color: 'red' },
      },
    },
    {
      title: '',
      buttons: [
        {
          text: 'Approve',
          icon: 'check',
          className: 'text-green',
          click: (record, _modal, comp) =>
            this.updateTicket(record.id, 'approved')
              .subscribe(res => {
                this.loading = false;
                comp?.setRow(record, { status: 'approved' });
                this.messageSrv.success('Ticket approved !');
                this.cdRef.markForCheck();
              }),
          iif: item => this.can(item, 'approve', () => item.status === 'pending'),
        },
        {
          text: 'Reject',
          icon: 'stop',
          className: 'text-red',
          pop: {
            title: 'Are you sure?',
            okType: 'danger',
            icon: 'exclamation-circle',
          },
          click: (record, _modal, comp) =>
            this.updateTicket(record.id, 'rejected')
              .subscribe(res => {
                this.loading = false;
                comp?.setRow(record, { status: 'rejected' });
                this.messageSrv.success('Ticket rejected !');
                this.cdRef.markForCheck();
              }),
          iif: item => this.can(item, 'reject', () => item.status === 'pending'),
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
    protected cacheSrv: CacheService<ITicket>,
    protected notificationSrv: NzNotificationService,
  ) {
    super(urlEndpoint, router, http, cdRef, startupSrv);
  }

  protected get entity(): Entity {
    return 'ticket';
  }

  protected get modelInstance(): new (...args: any[]) => any | undefined {
    return Ticket;
  }

  protected onError(args: any): void {}

  protected onSuccess(...args: any[]): void {}

  updateTicket(
    id: string | number,
    status: 'approved' | 'rejected',
  ): Observable<any> {
    this.loading = true;
    return this.http.put(`${ this.urlEndpoint.tickets }/${ id }`, { data: { status } })
      .pipe(
        catchError(this.msgObj, () => this.loading = false),
        untilDestroyed(this),
      );
  }
}
