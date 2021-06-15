import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SFComponent, SFSchema, SFUISchemaItem } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzMessageService } from 'ng-zorro-antd/message';

@UntilDestroy()
@Component({
  selector: 'app-user-user-edit',
  templateUrl: './user-edit.component.html',
})
export class UserUserEditComponent implements OnInit {

  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: number | string;
  title!: string;
  subTitle!: string;
  formData!: any;
  schema: SFSchema = {
    properties: {
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
      password: {
        type: 'string',
        title: 'Password',
        ui: {
          type: 'password'
        }
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
    required: ['first_name', 'last_name', 'email', 'country_code', 'cellphone', 'password'],
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
      this.title = 'New User';
    } else {
      this.title = `Edit User`;
      this.subTitle = `ID: ${this.id}`;
      this.fetchUserById(this.id);
    }
  }

  submit(value: any): void {
    if (this.id === 'new') {
      this.http.post(`/admin/users`, { data: value })
        .subscribe(res => {
          this.msgSrv.success('Created successfully !');
          this.router.navigateByUrl(`/user/list`);
        });
    } else {
      this.http.put(`/admin/users/${this.id}`, { data: value })
        .subscribe(res => {
          this.msgSrv.success('Updated successfully !');
          this.router.navigateByUrl(`/user/list`);
        });
    }
  }

  fetchUserById(id: number | string): void {
    this.http.get(`/admin/users/${id}`)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.formData = res.data;
        this.schema.properties!.email.readOnly = true;

        const passwordUi: SFUISchemaItem = this.schema.properties!.password.ui as SFUISchemaItem;
        passwordUi.hidden = true;
        this.sf.refreshSchema();
      });
  }
}
