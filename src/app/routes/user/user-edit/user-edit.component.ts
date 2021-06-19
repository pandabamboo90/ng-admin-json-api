import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserApi } from '@core';
import { SFComponent, SFSchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorResponse, JsonApiError } from '@shared';
import { each as _each, omit as _omit } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, finalize } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-user-user-edit',
  templateUrl: './user-edit.component.html',
})
export class UserUserEditComponent implements OnInit {

  @ViewChild('sf', { static: false }) sf!: SFComponent;

  id!: string;
  title!: string;
  subTitle!: string;
  user!: User;
  loading = false;
  formData!: any;
  schema: SFSchema = {
    properties: {
      name: {
        title: 'Name',
        type: 'string',
      },
      email: {
        type: 'string',
        title: 'Email',
        format: 'email',
      },
      mobile_phone: {
        type: 'string',
        title: 'Mobile',
        minLength: 9,
        maxLength: 12,
        pattern: '[0-9]+',
      },
      password: {
        type: 'string',
        title: 'Password',
        minLength: 8,
        ui: {
          type: 'password'
        },
      },
      confirm_password: {
        type: 'string',
        title: 'Confirm password',
        minLength: 8,
        ui: {
          type: 'password',
        },
      },
    },
    required: ['name', 'email', 'mobile_phone', 'password', 'confirm_password'],
  };

  constructor(
    private msgSrv: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    public http: _HttpClient,
    private userApi: UserApi,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id.toString();

    if (this.id === 'new') {
      this.title = 'Add User';
      this.subTitle = ``;
      this.user = this.userApi.new();
    } else {
      this.title = `Edit User`;
      this.subTitle = `ID: ${this.id}`;
      this.fetchUserById(this.id);
    }
  }

  submit(formData: any): void {
    this.loading = true;
    this.user.attributes = formData;

    this.user
      .save()
      .pipe(
        finalize(() => this.loading = false), // Success or not, turn off loading
      )
      .subscribe(res => {
        this.msgSrv.success('Updated successfully !');
        this.router.navigateByUrl(`/user/list`);
      }, (errRes: ErrorResponse) => {
        _each(errRes.errors, (errorObj: JsonApiError) => {
          const formItem = this.sf.getProperty('/' + errorObj.field);
          if (formItem) {
            formItem.setParentAndPlatErrors([{ keyword: 'server', message: errorObj.detail }], '');
          }
        });
      });
  }

  fetchUserById(id: string): void {
    this.userApi.get(id)
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded),
      )
      .subscribe((user: User) => {
        this.user = user;
        this.formData = user.attributes;
        this.updateUIForEditForm();
      });
  }

  private updateUIForEditForm(): void {
    // Set email as readonly field
    this.schema.properties!.email.readOnly = true;
    // Remove the password fields as we dont' want user to accidentally update password
    this.schema.properties = _omit(this.schema.properties, ['password', 'confirm_password']) as any;
    this.schema.required = _omit(this.schema.required, ['password', 'confirm_password']) as string[];

    this.sf.refreshSchema();
  }
}
