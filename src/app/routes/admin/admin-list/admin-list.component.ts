import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Admin, AdminApi } from '@core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { _HttpClient } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DocumentCollection } from 'ngx-jsonapi';
import { filter, finalize, tap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminListComponent implements OnInit {

  loading = false;
  data: STData[] = [];
  meta: { [p: string]: any } = {
    total: 0,
    per_page: 10, // page size
    page: 1, // page index
  };

  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '#', index: 'id' },
    { title: 'Image', render: 'cell-profile-img-tpl' },
    { title: 'Name', index: 'attributes.name' },
    { title: 'Email', index: 'attributes.email' },
    { title: 'Mobile', index: 'attributes.mobile_phone' },
    { title: 'Status', render: 'cell-locked-tpl' },
    {
      title: '',
      buttons: [
        {
          text: 'Edit',
          icon: 'edit',
          iif: (record => record.isActive),
          click: (item: any) => {
            this.router.navigateByUrl(`/admin/${item.id}`);
          },
        },
        {
          text: 'Lock',
          className: 'text-warning',
          icon: 'lock',
          iif: (record: Admin) => !record.attributes.locked && record.isActive,
          click: (record: Admin, _modal, comp) => {
            record.attributes.locked = true;
            comp?.setRow(record, {});

            record.save()
              .pipe(
                untilDestroyed(this),
              )
              .subscribe((res: any) => {
                this.msgSrv.success('Locked !');
                record.attributes.locked_at = res.data.attributes.locked_at;
              });
          },
        },
        {
          text: 'Unlock',
          className: 'text-purple',
          icon: 'unlock',
          iif: (record: Admin) => record.attributes.locked && record.isActive,
          click: (record: Admin, _modal, comp) => {
            record.attributes.locked = false;
            record.attributes.locked_at = null;
            comp?.setRow(record, {});

            record.save()
              .pipe(
                untilDestroyed(this),
              )
              .subscribe((res: any) => {
                this.msgSrv.success('Unlocked !');
              });
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
          iif: (record => record.isActive),
          click: (record: Admin, _modal, comp) => {
            this.http.delete(`/admins/${record.id}`)
              .pipe(
                untilDestroyed(this),
              )
              .subscribe((res) => {
                this.msgSrv.success(res.meta.message);
                record.attributes.deleted_at = res.data.attributes.deleted_at;
                comp?.setRow(record, {});
              });
          },
        },
        {
          text: 'Restore',
          className: 'text-default',
          icon: 'undo',
          iif: (record => !record.isActive),
          click: (record: Admin, _modal, comp) => {
            this.http.put(`/admins/${record.id}/restore`)
              .pipe(
                untilDestroyed(this),
              )
              .subscribe((res) => {
                this.msgSrv.success(res.meta.message);
                record.attributes.deleted_at = null;
                comp?.setRow(record, {});
              });
          },
        },
      ],
    },
  ];

  constructor(private http: _HttpClient,
              private router: Router,
              private adminApi: AdminApi,
              private msgSrv: NzMessageService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.fetchAdminList();
  }

  add(): void {
    this.router.navigateByUrl(`/admin/new`);
  }

  fetchAdminList(): void {
    this.adminApi.all({
        include: ['roles'],
        page: {
          number: this.meta.page,
          size: this.meta.per_page,
        },
      })
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.loading = true;
          this.cdr.detectChanges();
        }),
        filter(res => res.loaded), // Only get the response when every resources are loaded !
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }), // Success or not, turn off loading
      )
      .subscribe((res: DocumentCollection<Admin>) => {
        this.data = [...res.data];
        this.meta = { ...res.meta };
      });
  }

  onPageChange(ev: STChange): void {
    if (ev.type === 'pi') {
      this.meta.page = ev.pi;
      this.fetchAdminList();
    }
  }
}
