import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Role, RoleApi, User, UserApi } from '@core';
import { SFCheckboxWidgetSchema, SFComponent, SFSchema } from '@delon/form';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ErrorResponse, JsonApiError } from '@shared';
import { each as _each, map as _map, omit as _omit, difference as _difference } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DocumentCollection } from 'ngx-jsonapi';
import { Observable } from 'rxjs';
import { concatMap, filter, finalize, tap } from 'rxjs/operators';

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
  roles!: Role[];
  loading = false;
  requiredAttrs: string[] = ['name', 'email', 'mobile_phone', 'password', 'confirm_password'];
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
            maxLength: 20,
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
        required: this.requiredAttrs,
      },
      relationships: {
        type: 'object',
        properties: {
          roles: {
            type: 'object',
            properties: {
              data: {
                type: 'string',
                title: 'Roles',
                ui: {
                  widget: 'checkbox',
                } as SFCheckboxWidgetSchema,
              },
            },
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

    if (this.id === 'new') {
      this.title = 'Add User';
      this.subTitle = ``;
      this.user = this.userApi.new();

      this.fetchRoleList()
        .subscribe(() => {
          this.buildRoleCheckboxes([]);
        });

    } else {
      this.title = `Edit User`;
      this.subTitle = `ID: ${this.id}`;

      this.fetchRoleList()
        .pipe(
          concatMap(() => this.fetchUserById(this.id)),
        )
        .subscribe(() => {
          this.buildRoleCheckboxes(_map(this.user.relationships.roles.data, 'id'));
          this.setAttrValues();
          this.updateUIForEditForm();
        });
    }
  }

  submit(formData: any): void {
    const selectedRoleIds = this.sf.getProperty('/relationships/roles/data')?.value;
    const selectedRoles = this.roles.filter((role) => selectedRoleIds.indexOf(role.id) > -1);
    const removedRoleIds = _difference(_map(this.roles, 'id'), selectedRoleIds);

    _each(removedRoleIds, (id) => {
      this.user.removeRelationship('roles', id)
    });
    this.user.addRelationships(selectedRoles, 'roles');

    this.user
      .save()
      .pipe(
        tap(() => this.loading = true),
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
    return this.userApi.get(id)
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded),
        tap((res) => this.user = res),
      );
  }

  fetchRoleList(): Observable<DocumentCollection<Role>> {
    return this.roleApi.all()
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded),
        tap((res) => this.roles = res.data),
      );
  }

  private updateUIForEditForm(): void {
    // Set email as readonly field
    this.sf.getProperty('/attributes/email')!.schema.readOnly = true;

    // Remove the password fields as we dont' want user to accidentally update password
    this.sf.getProperty('/attributes')!.schema.required = _omit(this.requiredAttrs, ['password', 'confirm_password']) as string[];
    this.sf.getProperty('/attributes/password')?.setVisible(false);
    this.sf.getProperty('/attributes/confirm_password')?.setVisible(false);
  }

  private buildRoleCheckboxes(initialValues: string[] = []) {
    const rolesProp = this.sf.getProperty('/relationships/roles/data');

    rolesProp!.schema.enum = _map(this.roles, (item: Role) => {
      return { label: item.attributes.display_name, value: item.id };
    });
    rolesProp!.resetValue(initialValues, true);
  }

  private setAttrValues() {
    _each(this.user.attributes, (attrValue, attrKey) => {
      const formProp = this.sf.getProperty(`/attributes/${attrKey}`);

      if (formProp) {
        this.sf.setValue(`/attributes/${attrKey}`, attrValue);
      }
    });
  }
}
