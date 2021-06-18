import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserApi } from '@core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { _HttpClient } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map as _map } from 'lodash-es';
import { DocumentCollection } from 'ngx-jsonapi';
import { filter, map } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-user-user-list',
  templateUrl: './user-list.component.html',
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
          click: (item: any) => {
            this.router.navigateByUrl(`/user/${item.id}`);
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

  constructor(private http: _HttpClient,
              private router: Router,
              private userApi: UserApi) {
  }

  ngOnInit(): void {
    this.fetchUserList();
  }

  add(): void {
    this.router.navigateByUrl(`/user/new`);
  }

  fetchUserList(): void {
    this.loading = true;

    this.userApi.all({
        include: ['roles'],
        page: {
          number: this.meta.page,
          size: this.meta.per_page,
        },
      })
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded), // Only get the response when every resources are loaded !
        map((res) => {
          _map(res.data, (user: User) => {
            if (user.attributes.locked) {
              user.status.type = 'default';
              user.status.text = 'Locked';
            } else {
              user.status.type = 'success';
              user.status.text = 'Active';
            }
          });

          return res;
        }),
      )
      .subscribe((res: DocumentCollection<User>) => {
        this.data = res.data;
        this.meta = res.meta;
        this.loading = false;
      });
  }

  onPageChange(ev: STChange): void {
    if (ev.type === 'pi') {
      this.meta.page = ev.pi;
      this.fetchUserList();
    }
  }
}
