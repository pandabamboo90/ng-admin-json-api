import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permission, PermissionApi, Role, RoleApi, RolePermission, RolePermissionApi } from '@core';
import { _HttpClient } from '@delon/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { each as _each, every as _every } from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DocumentCollection } from 'ngx-jsonapi';
import { forkJoin, Observable } from 'rxjs';
import { filter, finalize, tap } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-role-permission-edit',
  templateUrl: './role-permission-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissionEditComponent implements OnInit {

  roles: Role[] = [];
  permissions: Permission[] = [];
  rolesPermissions: RolePermission[] = [];
  chkBoxesStates: any = {};
  loading = false;

  constructor(private http: _HttpClient,
              private router: Router,
              private msgSrv: NzMessageService,
              private cdr: ChangeDetectorRef,
              private roleApi: RoleApi,
              private permissionApi: PermissionApi,
              private rolePermissionApi: RolePermissionApi) {
  }

  ngOnInit(): void {
    forkJoin([
      this.fetchRoleList(),
      this.fetchPermissionList(),
      this.fetchRolePermissionList(),
    ]).pipe(
      tap(() => {
        this.loading = true;
        this.cdr.detectChanges();
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }), // Success or not, turn off loading
    ).subscribe((res) => {
      this.roles = [...res[0].data];
      this.permissions = [...res[1].data];
      this.rolesPermissions = [...res[2].data];

      this.roles.map((r: Role) => {
        this.chkBoxesStates[r.id] = {
          allChecked: false,
          indeterminate: false,
          permissions: {},
        };

        this.permissions.map((p: Permission) => {
          this.chkBoxesStates[r.id].permissions[p.id] = {
            checked: this.isChecked(r.id, p.id),
          };
        });

        this.setCheckAllChkBoxState(r.id);
      });
    });
  }

  save(): void {
    let data: any = [];

    _each(this.chkBoxesStates, (_, roleId) => {
      _each(this.chkBoxesStates[roleId].permissions, (item: any, permissionId) => {
        data.push({
          id: `${roleId}_${permissionId}`,
          type: this.rolePermissionApi.type,
          attributes: {
            role_id: roleId,
            permission_id: permissionId,
            status: item.checked,
          },
        });
      });
    });

    this.http.put(`/roles_permissions`, { data })
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.loading = true;
          this.cdr.detectChanges();
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }), // Success or not, turn off loading
      )
      .subscribe((res) => {
        this.msgSrv.success('Updated !');
      });
  }

  fetchPermissionList(): Observable<DocumentCollection<Permission>> {
    return this.permissionApi.all()
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded), // Only get the response when every resources are loaded !
      );
  }

  fetchRoleList(): Observable<DocumentCollection<Role>> {
    return this.roleApi.all()
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded), // Only get the response when every resources are loaded !
      );
  }


  fetchRolePermissionList(): Observable<DocumentCollection<RolePermission>> {
    return this.rolePermissionApi.all()
      .pipe(
        untilDestroyed(this),
        filter(res => res.loaded), // Only get the response when every resources are loaded !
      );
  }

  isChecked(roleId: string, permissionId: string): boolean {
    const idx = this.rolesPermissions.findIndex(item => {
      return item.attributes.role_id.toString() === roleId && item.attributes.permission_id.toString() === permissionId;
    });

    return idx > -1;
  }

  onCheckAllChange(roleId: string, value: boolean) {
    this.chkBoxesStates[roleId].indeterminate = false;
    this.chkBoxesStates[roleId].allChecked = value;
    _each(this.chkBoxesStates[roleId].permissions, (item: any) => {
      item.checked = value;
    });

    const arr = this.permissions.map((p: Permission) => {
      return {
        id: `${roleId}_${p.id}`,
        type: this.rolePermissionApi.type,
        attributes: {
          role_id: roleId,
          permission_id: p.id,
          status: value,
        },
      };
    });

    // this.updatedValues = _xorBy(this.updatedValues, arr, 'id');
  }

  onCheckSingleChange(roleId: string, permissionId: string, value: boolean) {
    this.setCheckAllChkBoxState(roleId);

    const arr = [{
      id: `${roleId}_${permissionId}`,
      type: this.rolePermissionApi.type,
      attributes: {
        role_id: roleId,
        permission_id: permissionId,
        status: value,
      },
    }];

    // this.updatedValues = _xorBy(this.updatedValues, arr, 'id');
  }

  private setCheckAllChkBoxState(roleId: string) {
    if (_every(this.chkBoxesStates[roleId].permissions, (item => !item.checked))) {
      this.chkBoxesStates[roleId].allChecked = false;
      this.chkBoxesStates[roleId].indeterminate = false;
    } else if (_every(this.chkBoxesStates[roleId].permissions, (item => item.checked))) {
      this.chkBoxesStates[roleId].allChecked = true;
      this.chkBoxesStates[roleId].indeterminate = false;
    } else {
      this.chkBoxesStates[roleId].indeterminate = true;
    }
  }
}
