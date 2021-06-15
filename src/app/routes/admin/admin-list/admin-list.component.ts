import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { _HttpClient, SettingsService } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IResponseMeta } from '@shared';

@UntilDestroy()
@Component({
  selector: 'app-admin-admin-list',
  templateUrl: './admin-list.component.html',
})
export class AdminAdminListComponent implements OnInit {

  loading = false;
  data: STData[] = [];
  meta: IResponseMeta = {
    total: 0,
    per_page: 10, // page size
    page: 1, // page index
  };

  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '#', index: 'id' },
    { title: 'First Name', index: 'first_name' },
    { title: 'Last Name', index: 'last_name' },
    { title: 'Email', index: 'email' },
    { title: 'KYC passed', index: 'kyc_passed', type: 'yn' },
    { title: 'Wallet ID', render: 'wallets-cell-tpl'},
    { title: 'Tenant', index: 'tenant.display_name' },
    {
      title: '',
      buttons: [
        {
          text: 'Send money',
          icon: 'dollar-circle',
          click: (item: any) => {
            this.router.navigateByUrl(`/user/${item.id}/send-money`);
          },
          iif: (item => item.kyc_passed && this.currentUser.id != item.id),
        },
        {
          text: 'Edit',
          icon: 'edit',
          click: (item: any) => {
            this.router.navigateByUrl(`/admin/${item.id}`);
          },
        },
        {
          text: 'Delete',
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
          },
        },
      ],
    },
  ];

  currentUser: any;

  constructor(private http: _HttpClient,
              private router: Router,
              private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    this.currentUser = this.settingsService.user;
    this.fetchAdminList();
  }

  add(): void {
    this.router.navigateByUrl(`/admin/new`);
  }

  fetchAdminList(): void {
    this.loading = true;
    this.http.get('/admins', {
        'page[size]': this.meta.per_page,
        'page[number]': this.meta.page,
      })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.data = res.data;
        this.meta = res.meta;
        this.loading = false;
      });
  }

  onPageChange(ev: STChange): void {
    if (ev.type === 'pi') {
      this.meta.page = ev.pi;
      this.fetchAdminList();
    }
  }
}
