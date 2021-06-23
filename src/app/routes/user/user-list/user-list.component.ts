import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserApi } from '@core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { _HttpClient } from '@delon/theme';
import { assetHost } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map as _map } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DocumentCollection } from 'ngx-jsonapi';
import { filter, finalize, map, tap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-user-user-list',
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserUserListComponent implements OnInit {

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
    { title: 'Roles', render: 'cell-roles-tpl' },
    {
      title: '',
      buttons: [
        {
          text: 'Edit',
          icon: 'edit',
          iif: (record => record.isActive),
          click: (item: any) => {
            this.router.navigateByUrl(`/user/${item.id}`);
          },
        },
        {
          text: 'Lock',
          className: 'text-warning',
          icon: 'lock',
          iif: (record: User) => !record.attributes.locked && record.isActive,
          click: (record: User, _modal, comp) => {
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
          iif: (record: User) => record.attributes.locked && record.isActive,
          click: (record: User, _modal, comp) => {
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
          click: (record: User, _modal, comp) => {
            this.http.delete(`/users/${record.id}`)
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
          click: (record: User, _modal, comp) => {
            this.http.put(`/users/${record.id}/restore`)
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
              private userApi: UserApi,
              private msgSrv: NzMessageService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.fetchUserList();
  }

  add(): void {
    this.router.navigateByUrl(`/user/new`);
  }

  fetchUserList(): void {
    this.userApi.all({
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
      .subscribe((res: DocumentCollection<User>) => {
        this.data = [...res.data];
        this.meta = { ...res.meta };
      });
  }

  onPageChange(ev: STChange): void {
    if (ev.type === 'pi') {
      this.meta.page = ev.pi;
      this.fetchUserList();
    }
  }
}
