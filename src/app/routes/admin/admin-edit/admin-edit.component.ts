import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SFComponent, SFSchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { first as _first, map as _map, omit as _omit } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';

@UntilDestroy()
@Component({
  selector: 'app-admin-admin-edit',
  templateUrl: './admin-edit.component.html',
})
export class AdminAdminEditComponent implements OnInit {

  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: number | string;
  title!: string;
  subTitle!: string;
  formData!: any;
  schema: SFSchema = {
    properties: {
      tenant_id: {
        title: 'Tenant',
        type: 'string',
      },
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
        format: 'email',
      },
      country_code: {
        type: 'string',
        title: 'Country code',
      },
      cellphone: {
        type: 'string',
        title: 'Phone number',
      },
    },
    required: ['first_name', 'last_name', 'email'],
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

    if (this.id === 'new') {
      this.title = 'New Admin';
      this.fetchTenantList();
    } else {
      this.title = `Edit Admin`;
      this.subTitle = `ID: ${this.id}`;
      this.fetchAdminById(this.id);
    }
  }

  submit(value: any): void {
    if (this.id === 'new') {
      this.http.post(`/admin/admins`, {data: value})
        .subscribe(res => {
          this.msgSrv.success('Created successfully !');
          this.router.navigateByUrl(`/admin/list`);
        });
    } else {
      this.http.put(`/admin/admins/${this.id}`, {data: value})
        .subscribe(res => {
          this.msgSrv.success('Updated successfully !');
          this.router.navigateByUrl(`/admin/list`);
        });
    }
  }

  fetchAdminById(id: number | string): void {
    this.http.get(`/admin/admins/${id}`)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.formData = _omit(res.data, ['tenant_id']);
        this.schema.properties!.tenant_id.default = res.data.tenant.display_name;
        this.schema.properties!.tenant_id.readOnly = true;
        this.schema.properties!.email.readOnly = true;
        this.sf.refreshSchema();
      });
  }

  fetchTenantList(): void {
    this.http.get('/admin/tenants', {
        'page[size]': 'all',
      })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const tenantList = _map(res.data, (item) => {
          return { label: item.display_name, value: item.id };
        });
        this.schema.properties!.tenant_id.enum = tenantList;
        this.schema.properties!.tenant_id.default = _first(tenantList)!.value;
        this.sf.refreshSchema();
      });
  }
}
