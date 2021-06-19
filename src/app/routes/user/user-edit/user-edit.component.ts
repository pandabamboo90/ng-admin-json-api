import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Role, RoleApi, User, UserApi } from '@core';
import { SFCheckboxWidgetSchema, SFComponent, SFSchema } from '@delon/form';
import { SFSchemaEnumType } from '@delon/form/src/schema';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorResponse, JsonApiError } from '@shared';
import { each as _each, map as _map, omit as _omit, pick as _pick } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DocumentCollection } from 'ngx-jsonapi';
import { Observable } from 'rxjs';
import { concatMap, filter, finalize, map } from 'rxjs/operators';

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
    type: 'object',
    properties: {
      attributes: {
        type: 'object',
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
              type: 'password',
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
      },
      relationships: {
        type: 'object',
        properties: {
          roles: {
            type: 'string',
            title: 'Roles',
            ui: {
              widget: 'checkbox',
              // asyncData: this.fetchRoleList.bind(this),
            } as SFCheckboxWidgetSchema,
          },
        },
      },
    },
  };

  constructor(
    private msgSrv: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    private userApi: UserApi,
    private roleApi: RoleApi,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id.toString();
    // this.fetchRoleList();

    if (this.id === 'new') {
      this.title = 'Add User';
      this.subTitle = ``;
      this.user = this.userApi.new();
    } else {
      this.title = `Edit User`;
      this.subTitle = `ID: ${this.id}`;

      this.fetchRoleList()
        .pipe(
          map((roleEnum) => this.schema.properties!.relationships.properties!.roles.enum = roleEnum),
          concatMap(() => this.fetchUserById(this.id)),
          map((user: User) => {
            this.user = user;
            this.formData = _pick(user, 'attributes');
            this.updateUIForEditForm();
          }),
        )
        .subscribe();
    }
  }

  submit(formData: any): void {
    this.loading = true;
    this.user = formData;

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

  fetchUserById(id: string): Observable<User> {
    console.log('fetchUserById');
    return this.userApi.get(id)
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded),
      );
  }

  fetchRoleList(): Observable<SFSchemaEnumType[]> {
    return this.roleApi.all()
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded),
        map((res: DocumentCollection<Role>) => {
          const roleEnum: SFSchemaEnumType[] = _map(res.data, (item: Role) => {
            return { label: item.attributes.display_name, value: item.id };
          });

          return roleEnum;
        }),
      );
  }

  private updateUIForEditForm(): void {
    // Set email as readonly field
    this.schema.properties!.attributes.properties!.email.readOnly = true;
    // Remove the password fields as we dont' want user to accidentally update password
    this.schema.properties!.attributes.properties = _omit(this.schema.properties!.attributes.properties, ['password', 'confirm_password']) as any;
    this.schema.properties!.attributes.required = _omit(this.schema.properties!.attributes.required, ['password', 'confirm_password']) as string[];

    // Set default value
    this.schema.properties!.relationships.properties!.roles.default = _map(this.user.relationships.roles.data, 'id')
  }
}
